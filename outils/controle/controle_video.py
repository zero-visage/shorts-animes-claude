"""Shorts animés - controle_video.py
Contrôle d'une vidéo AVANT de la livrer (ou d'un dossier d'images rendues) :
  - planche-contact de TOUTE la vidéo, une image toutes les 0,5 s (on regarde la séquence entière, pas 4 images)
  - images noires, images figées (identiques), images manquantes dans un dossier de rendu
  - "flashs" : une image très différente de la précédente ET de la suivante (objet qui disparaît/clignote)
  - son : volume (LUFS), pic, silence au début / à la fin
usage : python controle_video.py <video.mp4 | dossier_images> [dossier_sortie=chk/controle] [coupes_s séparées par des virgules]
Les coupes connues (changements de plan voulus) ne sont pas signalées comme flashs.
"""
import sys, os, glob, json, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def police(t):
    for p in ("C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, t)
    return ImageFont.load_default()

def images_video(video, l=72, h=128):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                        "-of", "csv=p=0", video], capture_output=True, text=True, check=True)
    a, b = r.stdout.strip().split("/"); fps = float(a) / float(b)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={l}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    return fps, np.frombuffer(raw, np.uint8).reshape(-1, h, l, 3).astype(np.float32) / 255

def images_dossier(dossier, l=72, h=128):
    fichiers = sorted(glob.glob(os.path.join(dossier, "f*.png")) + glob.glob(os.path.join(dossier, "f*.jpg")))
    nums = [int(os.path.basename(f)[1:5]) for f in fichiers]
    manquantes = sorted(set(range(min(nums), max(nums) + 1)) - set(nums)) if nums else []
    ims = np.stack([np.asarray(Image.open(f).convert("RGB").resize((l, h))).astype(np.float32) / 255 for f in fichiers])
    return 30.0, ims, fichiers, manquantes

def planche(source, fps, n, sortie, est_video, fichiers=None, pas=0.5, col=12, largeur=150):
    temps = list(np.arange(0.25, n / fps, pas))
    ims = []
    for t in temps:
        if est_video:
            p = os.path.join(os.path.dirname(sortie), "_t.jpg")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", source, "-frames:v", "1", p], check=True)
            ims.append(Image.open(p).convert("RGB"))
        else:
            ims.append(Image.open(fichiers[min(len(fichiers) - 1, int(t * fps))]).convert("RGB"))
    h = int(largeur * ims[0].height / ims[0].width)
    out = Image.new("RGB", (col * largeur, ((len(ims) + col - 1) // col) * h), (0, 0, 0)); d = ImageDraw.Draw(out); f = police(16)
    for i, (im, t) in enumerate(zip(ims, temps)):
        x, y = (i % col) * largeur, (i // col) * h
        out.paste(im.resize((largeur, h)), (x, y)); d.rectangle([x, y, x + 46, y + 20], fill=(0, 0, 0)); d.text((x + 3, y + 1), f"{t:.1f}", fill=(255, 230, 0), font=f)
    out.save(sortie, quality=88)

def son(video):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    if "Integrated loudness" not in r: return None
    lignes = r[r.rindex("Integrated loudness"):].splitlines()
    val = lambda k: next(float(l.split()[1]) for l in lignes if l.strip().startswith(k))
    return {"lufs": val("I:"), "pic_db": val("Peak:")}

def controler(source, sortie="chk/controle", coupes=()):
    os.makedirs(sortie, exist_ok=True)
    est_video = os.path.isfile(source)
    manquantes, fichiers = [], None
    if est_video: fps, ims = images_video(source)
    else: fps, ims, fichiers, manquantes = images_dossier(source)
    n = len(ims); rapport = []
    lum = ims.mean(axis=(1, 2, 3))
    noires = [i for i in range(n) if lum[i] < 0.02]
    d = np.abs(np.diff(ims, axis=0)).mean(axis=(1, 2, 3))
    figees = [i + 1 for i in range(len(d)) if d[i] < 1e-4]
    coupes_i = {int(round(c * fps)) for c in coupes}
    flashs = []
    for i in range(1, n - 1):
        a = np.abs(ims[i] - ims[i - 1]).mean(); b = np.abs(ims[i] - ims[i + 1]).mean(); c = np.abs(ims[i + 1] - ims[i - 1]).mean()
        if a > 0.05 and b > 0.05 and c < 0.5 * min(a, b) and not any(abs(i - k) <= 1 for k in coupes_i):
            flashs.append(i)
    rapport.append(f"# Contrôle : {os.path.basename(source)}")
    rapport.append(f"- {n} images, {n / fps:.2f} s à {fps:.0f} i/s")
    rapport.append(f"- images manquantes : {manquantes[:30] or 'aucune'}")
    rapport.append(f"- images noires : {noires[:30] or 'aucune'}")
    rapport.append(f"- images figées (identiques à la précédente) : {figees[:30] or 'aucune'}" + (" (normal si un plan est volontairement fixe)" if figees else ""))
    rapport.append(f"- flashs (objet qui disparaît ou clignote 1 image) : {flashs[:30] or 'aucun'}")
    if est_video:
        s = son(source)
        if s:
            ok = abs(s["lufs"] + 14) <= 1 and s["pic_db"] <= -1.0
            rapport.append(f"- son : {s['lufs']:.1f} LUFS, pic {s['pic_db']:.1f} dB -> {'OK' if ok else 'À CORRIGER (cible -14 LUFS, pic sous -1 dB)'}")
        else: rapport.append("- son : pas de piste audio")
    planche(source, fps, n, os.path.join(sortie, "planche_05s.jpg"), est_video, fichiers)
    rapport.append(f"- planche-contact (une image toutes les 0,5 s) : {sortie}/planche_05s.jpg -> LA REGARDER EN ENTIER")
    open(os.path.join(sortie, "rapport.md"), "w", encoding="utf8").write("\n".join(rapport))
    print("\n".join(rapport))

if __name__ == "__main__":
    out = sys.argv[2] if len(sys.argv) > 2 else "chk/controle"
    cps = [float(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 and sys.argv[3] else []
    controler(sys.argv[1], out, cps)
