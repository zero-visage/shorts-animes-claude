"""Shorts animés - images_reference.py
Découpe la vidéo de RÉFÉRENCE (celle qu'on veut égaler) en une image toutes les 0,5 s, en pleine résolution,
+ une planche-contact numérotée. Sert ensuite à comparer.py à chaque tour.

usage : python images_reference.py <reference.mp4> <dossier_sortie> [pas_en_s=0.5] [debut=0.25]
sortie : <dossier>/ref_0000.25.jpg ... + <dossier>/planche.jpg + <dossier>/index.json
La référence sert UNIQUEMENT à l'étude privée : jamais dans la vidéo publiée, jamais redistribuée.
"""
import sys, os, json, subprocess
from PIL import Image, ImageDraw, ImageFont

def duree(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())

def police(taille):
    for p in ("C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/System/Library/Fonts/Supplemental/Arial Bold.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, taille)
    return ImageFont.load_default()

def extraire(video, dossier, pas=0.5, debut=0.25):
    os.makedirs(dossier, exist_ok=True)
    d = duree(video); temps = []; t = debut
    while t < d - 0.02:
        temps.append(round(t, 2)); t += pas
    fichiers = []
    for t in temps:
        f = os.path.join(dossier, f"ref_{t:07.2f}.jpg")
        if not os.path.exists(f):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", video, "-frames:v", "1", "-q:v", "2", f], check=True)
        fichiers.append(f)
    json.dump({"video": os.path.abspath(video), "duree": d, "pas": pas, "temps": temps,
               "fichiers": [os.path.basename(f) for f in fichiers]}, open(os.path.join(dossier, "index.json"), "w"), indent=1)
    planche(fichiers, temps, os.path.join(dossier, "planche.jpg"))
    print(f"{len(fichiers)} images de référence -> {dossier}")
    return fichiers, temps

def planche(fichiers, temps, sortie, colonnes=10, largeur=216):
    ims = [Image.open(f).convert("RGB") for f in fichiers]
    h = int(largeur * ims[0].height / ims[0].width)
    lignes = (len(ims) + colonnes - 1) // colonnes
    out = Image.new("RGB", (colonnes * largeur, lignes * h), (20, 20, 20)); d = ImageDraw.Draw(out); fnt = police(18)
    for i, (im, t) in enumerate(zip(ims, temps)):
        x, y = (i % colonnes) * largeur, (i // colonnes) * h
        out.paste(im.resize((largeur, h)), (x, y))
        d.rectangle([x, y, x + 62, y + 24], fill=(0, 0, 0)); d.text((x + 4, y + 2), f"{t:.2f}", fill=(255, 230, 0), font=fnt)
    out.save(sortie, quality=88)

if __name__ == "__main__":
    pas = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    debut = float(sys.argv[4]) if len(sys.argv) > 4 else 0.25
    extraire(sys.argv[1], sys.argv[2], pas, debut)
