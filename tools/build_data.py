# Passo 3 della filiera: raccoglie le schede di tutti i pacchetti, le controlla e scrive i file
# che l'app legge (public/data/index.json e un file per pacchetto).
#   python3 tools/build_data.py
#
# Filiera completa per aggiungere schede:
#   1. scrivi le schede in tools/content/<pacchetto>.py (testi dalla voce di Wikipedia indicata in "source")
#   2. python3 tools/commons.py              -> autore e licenza delle immagini, da Commons
#   3. python3 tools/build_data.py           -> controlli automatici e file per l'app
#   4. python3 tools/contact_sheet.py <pack> -> provino delle foto da controllare a occhio
import importlib, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'content'))
import lib

PACKS = [  # ordine dei pacchetti: id, nome mostrato
    ("sensori", "Sensori"),
    ("attuatori", "Attuatori e motori"),
    ("componenti", "Componenti di base"),
    ("connettori", "Connettori e cablaggi"),
    ("ambiente", "Sensori ambientali"),
]
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')


def load_content():
    if lib.CARDS:
        return
    for pid, _ in PACKS:
        lib.set_pack(pid)
        importlib.import_module(pid)


def check(indice):
    errors = []
    ids = [c["id"] for c in lib.CARDS]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        errors.append(f"id ripetuti: {dup}")
    pids = {p["id"] for p in indice.principles}
    areas = {a["id"] for a in indice.areas}
    used_principles = set()
    for c in lib.CARDS:
        where = f'[{c["id"]}]'
        for f in ("name", "hook", "short", "steps", "source", "quiz", "area", "sub", "principles"):
            if not c.get(f):
                errors.append(f"{where} campo mancante: {f}")
        if c.get("area") not in areas:
            errors.append(f"{where} area sconosciuta: {c.get('area')}")
        if c.get("sub") not in indice.subs:
            errors.append(f"{where} sottocategoria sconosciuta: {c.get('sub')}")
        for p in c.get("principles", []):
            if p not in pids:
                errors.append(f"{where} principio sconosciuto: {p}")
            used_principles.add(p)
        for r in c.get("related", []):
            if r not in ids:
                errors.append(f"{where} collegamento a scheda inesistente: {r}")
            if r == c["id"]:
                errors.append(f"{where} collegata a se stessa")
        for q in c.get("quiz", []):
            if not (0 <= q["correct"] < len(q["options"])):
                errors.append(f"{where} risposta corretta fuori elenco: {q['q'][:40]}")
            if len(set(q["options"])) != len(q["options"]):
                errors.append(f"{where} risposte ripetute: {q['q'][:40]}")
            if not q.get("expl"):
                errors.append(f"{where} domanda senza spiegazione: {q['q'][:40]}")
        if not str(c.get("source", {}).get("url", "")).startswith("https://"):
            errors.append(f"{where} fonte senza link")
        if c.get("diagram") and c["diagram"] not in DIAGRAMS:
            errors.append(f"{where} schema inesistente nel registro dell'app: {c['diagram']}")
        if not c.get("diagram"):
            NO_DIAGRAM.append(c["id"])
    clash = pids & set(ids)
    if clash:
        errors.append(f"stesso id usato da una scheda e da un principio (la mappa li confonderebbe): {clash}")
    for f in lib.FILES:
        if f not in lib.CACHE:
            errors.append(f"immagine non verificata su Commons: {f} (esegui tools/commons.py)")
    unused = pids - used_principles
    return errors, unused


# schemi disponibili nell'app: letti dal registro src/diagrams/registry.jsx
import re as _re
_reg = open(os.path.join(os.path.dirname(__file__), '..', 'src', 'diagrams', 'registry.jsx')).read()
_reg = _reg[_reg.index('export const VIS'):]
DIAGRAMS = set(_re.findall(r"^\s+'?([a-z0-9-]+)'?:\s*(?:anim|vis|\{)", _reg, _re.M))
NO_DIAGRAM = []

if __name__ == "__main__":
    import indice
    load_content()
    errors, unused = check(indice)
    if errors:
        print("ERRORI:", *errors, sep="\n  ")
        sys.exit(1)
    os.makedirs(OUT, exist_ok=True)
    packs = []
    for pid, name in PACKS:
        cards = [c for c in lib.CARDS if c["pack"] == pid]
        json.dump({"pack": pid, "cards": cards}, open(os.path.join(OUT, f"{pid}.json"), "w"), ensure_ascii=False, separators=(",", ":"))
        packs.append({"id": pid, "name": name, "file": f"{pid}.json", "count": len(cards)})
        print(f"{pid}: {len(cards)} schede, {os.path.getsize(os.path.join(OUT, pid + '.json'))} byte")
    index = {"version": 2, "areas": indice.areas,
             "subs": [{"id": k, "area": v[0], "name": v[1]} for k, v in indice.subs.items()],
             "principles": indice.principles, "packs": packs}
    json.dump(index, open(os.path.join(OUT, "index.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    if NO_DIAGRAM:
        print("Nota: schede ancora senza schema:", ", ".join(NO_DIAGRAM))
    if unused:
        print("Nota: principi senza schede (non compaiono in mappa):", ", ".join(sorted(unused)))
    print("Tutto a posto.")
