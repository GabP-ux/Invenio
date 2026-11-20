# Strumenti comuni per scrivere le schede di Invenio.
import hashlib, json, os, urllib.parse

HERE = os.path.dirname(__file__)
CACHE_FILE = os.path.join(HERE, 'commons_cache.json')
CACHE = json.load(open(CACHE_FILE)) if os.path.exists(CACHE_FILE) else {}
STRICT = True          # in fase di build: un'immagine senza crediti verificati blocca tutto
CARDS = []             # tutte le schede, nell'ordine in cui sono scritte
FILES = []             # tutti i file di Commons citati
_pack = [None]


def set_pack(name):
    _pack[0] = name


def thumb(file, w=500):
    fn = file.replace(' ', '_')
    h = hashlib.md5(fn.encode()).hexdigest()
    q = urllib.parse.quote(fn)
    ext = '.png' if fn.lower().endswith(('.svg', '.gif')) else ''
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}{ext}"


def img(file, cap, artist=None, lic=None, fit='cover', bg=None):
    """Foto o schema da Wikimedia Commons. Autore e licenza, se non indicati,
    vengono letti da commons_cache.json (si aggiorna con tools/commons.py)."""
    FILES.append(file)
    meta = CACHE.get(file)
    if artist is None or lic is None:
        if not meta:
            if STRICT:
                raise SystemExit(f'Crediti mancanti per "{file}": esegui  python3 tools/commons.py')
            meta = {'artist': '?', 'license': '?'}
        artist = artist or meta['artist']
        lic = lic or meta['license']
    d = {"file": file, "src": thumb(file, 500), "thumb": thumb(file, 250), "cap": cap,
         "credit": f"{artist} · {lic}",
         "page": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(file.replace(' ', '_'))}
    if fit != 'cover':
        d["fit"] = fit
    if bg:
        d["bg"] = bg
    return d


def card(**k):
    for f in ("variants", "uses", "related", "images"):
        k.setdefault(f, [])
    for f in ("diagram", "sim", "formula", "note"):
        k.setdefault(f, None)
    k["pack"] = _pack[0]
    CARDS.append(k)
