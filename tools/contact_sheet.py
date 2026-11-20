# Passo 4 della filiera: scarica le miniature di un pacchetto e le mette in un unico foglio
# con la didascalia, per controllare a colpo d'occhio che ogni foto mostri ciò che dice.
#   python3 tools/contact_sheet.py attuatori
import os, subprocess, sys, time, textwrap
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageDraw
import lib
from build_data import load_content
load_content()
pack = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), '.preview'); os.makedirs(out, exist_ok=True)
items = [(c['id'], im) for c in lib.CARDS if c['pack'] == pack for im in c['images']]
tiles = []
for cid, im in items:
    f = os.path.join(out, f"{cid}_{abs(hash(im['file'])) % 10**6}.img")
    if not os.path.exists(f) or os.path.getsize(f) < 2000:
        for t in range(3):
            code = subprocess.run(["curl", "-sS", "--max-time", "40", "-A", "InvenioPersonal/0.2", "-o", f, "-w", "%{http_code}", im['thumb']], capture_output=True, text=True).stdout
            if code == '200': break
            time.sleep(15)
        time.sleep(4)
    tiles.append((cid, im, f))
W, H, cols = 260, 300, 4
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * H), 'white'); d = ImageDraw.Draw(sheet)
for i, (cid, im, f) in enumerate(tiles):
    x, y = (i % cols) * W, (i // cols) * H
    try:
        pic = Image.open(f).convert('RGB'); pic.thumbnail((W - 8, 190)); sheet.paste(pic, (x + 4, y + 4))
    except Exception:
        d.text((x + 8, y + 80), 'NON SCARICATA', fill='red')
    d.text((x + 4, y + 198), cid, fill='black')
    for j, line in enumerate(textwrap.wrap(im['cap'], 40)[:6]):
        d.text((x + 4, y + 212 + j * 13), line, fill='#333')
dest = os.path.join(out, f'provino_{pack}.jpg'); sheet.save(dest, quality=80); print(dest)
