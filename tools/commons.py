# Passo 2 della filiera: legge da Wikimedia Commons autore e licenza di ogni immagine citata
# nelle schede e li salva in commons_cache.json. Segnala i file che non esistono.
#   python3 tools/commons.py
import json, os, re, subprocess, sys, time, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
import lib
lib.STRICT = False
from build_data import load_content
load_content()

UA = "InvenioPersonal/0.2 (personal learning app)"
clean = lambda s: re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', s or '')).strip()

def short_artist(a):
    if a.lower().startswith('no machine-readable author'):
        return 'autore non indicato'
    a = re.sub(r'^[^:]*\.(jpe?g|png|svg|gif):\s*', '', a, flags=re.I)   # opere derivate: "file.jpg: Autore: ..."
    a = a.split(':')[0]
    a = re.sub(r'\(talk.*?\)|\(user.*?\)', '', a, flags=re.I)
    a = re.split(r',? took this|, own work|\s{2,}', a)[0]
    return a.strip(' ,.')[:60] or 'autore sconosciuto'

todo = sorted({f for f in lib.FILES if f not in lib.CACHE})
print(len(lib.FILES), 'immagini citate,', len(todo), 'da verificare')
missing = []
for i in range(0, len(todo), 20):
    batch = todo[i:i + 20]
    params = {"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "extmetadata",
              "titles": "|".join("File:" + f for f in batch)}
    data = None
    for attempt in range(5):   # Commons limita le richieste troppo ravvicinate: si riprova con calma
        out = subprocess.run(["curl", "-sS", "--max-time", "60", "-A", UA, "https://commons.wikimedia.org/w/api.php",
                              "--data", urllib.parse.urlencode(params)], capture_output=True, text=True).stdout
        try:
            data = json.loads(out); break
        except json.JSONDecodeError:
            time.sleep(10 * (attempt + 1))
    if data is None:
        sys.exit("Commons non risponde: riprova tra qualche minuto.")
    norm = {n["to"]: n["from"] for n in data["query"].get("normalized", [])}
    for p in data["query"]["pages"].values():
        title = norm.get(p["title"], p["title"])[5:]
        if "missing" in p or "imageinfo" not in p:
            missing.append(title); continue
        m = p["imageinfo"][0].get("extmetadata", {})
        lic = clean(m.get("LicenseShortName", {}).get("value"))
        lic = {"Public domain": "pubblico dominio", "Attribution": "attribuzione"}.get(lic, lic)
        lib.CACHE[title.replace('_', ' ')] = {"artist": short_artist(clean(m.get("Artist", {}).get("value"))), "license": lic}
    time.sleep(2)

json.dump(dict(sorted(lib.CACHE.items())), open(lib.CACHE_FILE, "w"), ensure_ascii=False, indent=1)
if missing:
    print("ATTENZIONE, file non trovati su Commons:", *missing, sep="\n  ")
    sys.exit(1)
print("Crediti aggiornati.")
