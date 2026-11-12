"""Shorts animés - comparer_avant_apres.py
Après chaque correction : les MÊMES images avant | après, côte à côte, + une feuille d'ensemble (haut = avant, bas = après)
+ les chiffres (luminosité médiane, ombres p5, % brûlé) pour voir et prouver que c'est mieux.
usage : python comparer_avant_apres.py <dossier_avant> <dossier_apres> <dossier_sortie> [images ex. 20,110,200]
"""
import sys, os, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def police(t):
    for p in ("C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, t)
    return ImageFont.load_default()

def chiffres(im):
    y = np.asarray(im.convert("L")).astype(np.float32)
    return f"méd {np.median(y):.0f}  p5 {np.percentile(y, 5):.0f}  brûlé {100 * (y >= 254).mean():.1f}%"

def main():
    av, ap, out = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(out, exist_ok=True)
    noms = sorted(os.path.basename(p) for p in glob.glob(os.path.join(av, "*.png")) + glob.glob(os.path.join(av, "*.jpg")))
    if len(sys.argv) > 4:
        voulues = {int(x) for x in sys.argv[4].split(",")}
        noms = [n for n in noms if any(int(s) in voulues for s in __import__("re").findall(r"\d+", n)[-1:])]
    f = police(30); petites_av, petites_ap = [], []
    for n in noms:
        if not os.path.exists(os.path.join(ap, n)): continue
        a, b = Image.open(os.path.join(av, n)).convert("RGB"), Image.open(os.path.join(ap, n)).convert("RGB").resize(Image.open(os.path.join(av, n)).size)
        w, h = a.size; o = Image.new("RGB", (2 * w + 16, h + 60), (15, 15, 15)); d = ImageDraw.Draw(o)
        o.paste(a, (0, 60)); o.paste(b, (w + 16, 60))
        d.text((10, 10), "AVANT  " + chiffres(a), fill=(255, 200, 80), font=f); d.text((w + 26, 10), "APRÈS  " + chiffres(b), fill=(120, 255, 140), font=f)
        o.save(os.path.join(out, "av_ap_" + os.path.splitext(n)[0] + ".jpg"), quality=88)
        petites_av.append(a.resize((w * 400 // h, 400))); petites_ap.append(b.resize((w * 400 // h, 400)))
    if petites_av:
        pw = petites_av[0].width; g = Image.new("RGB", (pw * len(petites_av), 800), (0, 0, 0))
        for i, (x, y) in enumerate(zip(petites_av, petites_ap)): g.paste(x, (i * pw, 0)); g.paste(y, (i * pw, 400))
        g.save(os.path.join(out, "ensemble.jpg"), quality=86)
    print(f"{len(petites_av)} comparaisons -> {out} (ensemble.jpg : haut = avant, bas = après)")

if __name__ == "__main__":
    main()
