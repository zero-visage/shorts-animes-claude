"""Shorts animés - comparer.py
LE cœur de la méthode : à chaque tour, chaque image de NOTRE vidéo est posée À CÔTÉ de l'image de la référence
au même instant (toutes les 0,5 s), + des mesures de couleur pour corriger sans deviner.

usage :
  python comparer.py <nos_images_ou_notre_video> <dossier_reference> <dossier_sortie> [decalage_s=0]
    - nos images : un dossier de PNG/JPG numérotés f0000.png... (30 i/s) OU une vidéo .mp4 (aperçu basse résolution)
    - dossier_reference : fait par images_reference.py (index.json + ref_*.jpg)
    - decalage_s : si notre histoire est décalée (ex. notre hook dure 0,3 s de plus)
sortie :
  <sortie>/paires/paire_XX.XX.jpg   (nous | référence, grand format, pour regarder chaque moment)
  <sortie>/confronto.jpg            (toutes les paires sur une feuille)
  <sortie>/mesures.md               (luminosité, saturation, teinte dominante, contraste : nous vs référence, avec les écarts)
"""
import sys, os, json, glob, subprocess, colorsys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def police(t):
    for p in ("C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, t)
    return ImageFont.load_default()

def notre_image(source, t, tmp):
    if os.path.isdir(source):
        i = int(round(t * 30))
        for motif in (f"f{i:04d}.png", f"f{i:04d}.jpg", f"{i:04d}.png", f"frame_{i:04d}.png"):
            p = os.path.join(source, motif)
            if os.path.exists(p): return Image.open(p).convert("RGB")
        # sinon l'image la plus proche disponible
        dispo = sorted(glob.glob(os.path.join(source, "f*.png")) + glob.glob(os.path.join(source, "f*.jpg")))
        if not dispo: return None
        nums = [int(os.path.basename(p)[1:5]) for p in dispo]
        k = int(np.argmin([abs(n - i) for n in nums]))
        return Image.open(dispo[k]).convert("RGB") if abs(nums[k] - i) <= 3 else None
    p = os.path.join(tmp, f"nous_{t:07.2f}.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", source, "-frames:v", "1", "-q:v", "2", p], check=False)
    return Image.open(p).convert("RGB") if os.path.exists(p) else None

def mesures(im):
    a = np.asarray(im.resize((180, 320))).astype(np.float32) / 255
    lum = a @ np.array([0.2126, 0.7152, 0.0722])
    mx, mn = a.max(axis=2), a.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    # teinte dominante des pixels colorés
    px = a[sat > 0.25]
    if len(px):
        h = np.array([colorsys.rgb_to_hsv(*p)[0] for p in px[:: max(1, len(px) // 2000)]])
        teinte = float(np.degrees(np.arctan2(np.sin(2 * np.pi * h).mean(), np.cos(2 * np.pi * h).mean())) % 360)
    else: teinte = -1
    haut = a[:40].reshape(-1, 3).mean(axis=0)            # haut de l'image : souvent le fond
    return {"lum": float(lum.mean()), "contraste": float(lum.std()), "sat": float(sat.mean()),
            "teinte": teinte, "fond_rgb": [round(float(x), 2) for x in haut],
            "hautes_lumieres": float((lum > 0.9).mean()), "noirs": float((lum < 0.08).mean())}

def nom_teinte(h):
    if h < 0: return "gris"
    noms = [(15, "rouge"), (45, "orange"), (70, "jaune"), (160, "vert"), (200, "cyan"), (250, "bleu"), (290, "violet"), (335, "magenta"), (361, "rouge")]
    return next(n for lim, n in noms if h < lim)

def comparer(source, dossier_ref, sortie, decalage=0.0):
    idx = json.load(open(os.path.join(dossier_ref, "index.json")))
    os.makedirs(os.path.join(sortie, "paires"), exist_ok=True); tmp = os.path.join(sortie, "_tmp"); os.makedirs(tmp, exist_ok=True)
    H = 960; fnt = police(26); petites = []; lignes = ["| t (s) | lum nous/réf | sat nous/réf | contraste nous/réf | teinte nous/réf | à corriger |", "|---|---|---|---|---|---|"]
    ecarts = {"lum": [], "sat": [], "contraste": []}
    for t, f in zip(idx["temps"], idx["fichiers"]):
        ref = Image.open(os.path.join(dossier_ref, f)).convert("RGB")
        nous = notre_image(source, t + decalage, tmp)
        w = int(H * ref.width / ref.height)
        paire = Image.new("RGB", (2 * w + 12, H + 40), (15, 15, 15)); d = ImageDraw.Draw(paire)
        if nous is not None: paire.paste(nous.resize((w, H)), (0, 40))
        else: d.text((20, H // 2), "image manquante", fill=(255, 80, 80), font=fnt)
        paire.paste(ref.resize((w, H)), (w + 12, 40))
        d.text((8, 6), f"NOUS  {t + decalage:.2f} s", fill=(255, 230, 0), font=fnt)
        d.text((w + 20, 6), f"RÉFÉRENCE  {t:.2f} s", fill=(120, 220, 255), font=fnt)
        paire.save(os.path.join(sortie, "paires", f"paire_{t:07.2f}.jpg"), quality=88)
        petites.append(paire.resize((paire.width * 300 // paire.height, 300)))
        if nous is None: continue
        mn, mr = mesures(nous), mesures(ref)
        a_faire = []
        if mn["lum"] < mr["lum"] - 0.06: a_faire.append("plus clair")
        if mn["lum"] > mr["lum"] + 0.06: a_faire.append("plus sombre")
        if mn["sat"] < mr["sat"] - 0.06: a_faire.append("plus saturé")
        if mn["sat"] > mr["sat"] + 0.06: a_faire.append("moins saturé")
        if mn["contraste"] < mr["contraste"] - 0.04: a_faire.append("plus de contraste")
        if mn["hautes_lumieres"] < mr["hautes_lumieres"] * 0.5 and mr["hautes_lumieres"] > 0.01: a_faire.append("plus de reflets/lueurs")
        if nom_teinte(mn["teinte"]) != nom_teinte(mr["teinte"]): a_faire.append(f"couleur dominante {nom_teinte(mr['teinte'])}")
        for k in ecarts: ecarts[k].append(mn[k] - mr[k])
        lignes.append(f"| {t:.2f} | {mn['lum']:.2f} / {mr['lum']:.2f} | {mn['sat']:.2f} / {mr['sat']:.2f} | {mn['contraste']:.2f} / {mr['contraste']:.2f} | "
                      f"{nom_teinte(mn['teinte'])} / {nom_teinte(mr['teinte'])} | {', '.join(a_faire) or 'ok'} |")
    # feuille complète, 6 paires par ligne
    col = 6; pw, ph = petites[0].size
    feuille = Image.new("RGB", (col * pw, ((len(petites) + col - 1) // col) * ph), (10, 10, 10))
    for i, p in enumerate(petites): feuille.paste(p, ((i % col) * pw, (i // col) * ph))
    feuille.save(os.path.join(sortie, "confronto.jpg"), quality=86)
    resume = ["# Comparaison nous / référence", ""]
    if ecarts["lum"]:
        resume += [f"- Luminosité moyenne : {np.mean(ecarts['lum']):+.3f} (négatif = nous plus sombres)",
                   f"- Saturation moyenne : {np.mean(ecarts['sat']):+.3f} (négatif = nous plus ternes)",
                   f"- Contraste moyen : {np.mean(ecarts['contraste']):+.3f}", ""]
    resume += ["Les chiffres ne remplacent pas l'œil : regarder CHAQUE paire dans paires/ et noter dans DECISIONS.md",
               "les différences de style (couleur des objets, détails, lueurs, vitesse, cadrage).", ""] + lignes
    open(os.path.join(sortie, "mesures.md"), "w", encoding="utf8").write("\n".join(resume))
    print(f"{len(petites)} paires -> {sortie}/confronto.jpg et {sortie}/mesures.md")

if __name__ == "__main__":
    comparer(sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 0.0)
