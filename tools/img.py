import hashlib, urllib.parse
def thumb(file, w=500):
    fn=file.replace(' ','_')
    h=hashlib.md5(fn.encode()).hexdigest()
    q=urllib.parse.quote(fn)
    ext='.png' if fn.lower().endswith('.svg') else ''
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}{ext}"
def img(file, cap, artist, lic, fit='cover', bg=None):
    d={"file":file,"src":thumb(file,500),"thumb":thumb(file,250),"cap":cap,"credit":f"{artist} · {lic}",
       "page":"https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(file.replace(' ','_'))}
    if fit!='cover': d["fit"]=fit
    if bg: d["bg"]=bg
    return d
