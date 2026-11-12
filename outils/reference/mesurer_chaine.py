"""Shorts animés - mesurer_chaine.py
Mesure les N Shorts les plus vus d'une chaîne de référence (étude privée) et écrit les chiffres de style :
durée, volume (LUFS), luminosité, contraste, saturation, couleur et part du fond bleu, rythme (changements d'image),
coupes, mouvement. Les vidéos sont téléchargées dans un dossier privé, analysées, et peuvent être supprimées ensuite
(on ne garde que les chiffres dans le JSON).

installation : pip install yt-dlp numpy pillow
usage : python mesurer_chaine.py <url_de_la_chaine_shorts> <dossier_prive> [N=50] [--garder-videos]
   ex.  python mesurer_chaine.py https://www.youtube.com/@<chaine>/shorts D:/etude_ref 50
sortie : <dossier>/mesures.json (une ligne par Short) + <dossier>/resume.md (médianes, p10-p90)
Règle : ces vidéos ne servent qu'à mesurer. Jamais dans nos vidéos, jamais republiées.
"""
import sys, os, json, subprocess, statistics
import numpy as np

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
from analyse_mouvement import analyser as analyser_mouvement

def liste_shorts(url, n):
    r = subprocess.run(["yt-dlp", "--flat-playlist", "--dump-json", "--playlist-end", "400", url], capture_output=True, text=True)
    items = [json.loads(l) for l in r.stdout.splitlines() if l.strip()]
    items = [i for i in items if i.get("view_count")]
    items.sort(key=lambda i: -i["view_count"])
    return items[:n]

def telecharger(id_, dossier):
    out = os.path.join(dossier, id_ + ".mp4")
    if not os.path.exists(out):
        subprocess.run(["yt-dlp", "-f", "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720]", "--merge-output-format", "mp4",
                        "-o", out, f"https://www.youtube.com/shorts/{id_}"], check=True, capture_output=True)
    return out

def lufs(video):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", video, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    try: return float([l for l in r.splitlines() if l.strip().startswith("I:")][-1].split()[1])
    except Exception: return None

def look(video, fps=2):
    """une image toutes les 0,5 s en 90x160 : luminosité, contraste, saturation, couleur du bord, fond bleu"""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps={fps},scale=90:160", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, 160, 90, 3).astype(np.float32) / 255
    y = a @ np.array([0.2126, 0.7152, 0.0722])
    mx, mn = a.max(axis=3), a.min(axis=3); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    bord = np.concatenate([a[:, :10].reshape(len(a), -1, 3), a[:, :, :7].reshape(len(a), -1, 3), a[:, :, -7:].reshape(len(a), -1, 3)], axis=1).mean(axis=1) * 255
    bleu = (bord[:, 2] > 150) & (bord[:, 2] > bord[:, 0] + 40) & (bord[:, 2] > bord[:, 1] - 10)
    res = dict(luminosite=float(np.median(y.mean(axis=(1, 2)))), contraste=float(np.median(y.std(axis=(1, 2)))),
               saturation=float(np.median(sat.mean(axis=(1, 2)))), part_fond_bleu=float(bleu.mean()),
               luminosite_image1=float(y[0].mean()))
    if bleu.any(): res["fond_bleu_rgb"] = [int(v) for v in np.median(bord[bleu], axis=0)]
    return res

def main():
    url, dossier = sys.argv[1], sys.argv[2]; n = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].isdigit() else 50
    garder = "--garder-videos" in sys.argv
    os.makedirs(dossier, exist_ok=True)
    resultats = []
    for k, it in enumerate(liste_shorts(url, n), 1):
        try:
            v = telecharger(it["id"], dossier)
            m = analyser_mouvement(v)
            r = dict(rang=k, id=it["id"], titre=it.get("title", ""), vues=it["view_count"], duree_s=m["duree"], lufs=lufs(v),
                     plans=len(m["plans"]), un_changement_toutes_s=round(m["duree"] / max(1, len(m["plans"])), 2), **look(v))
            resultats.append(r); print(k, r["titre"][:40], r["duree_s"], r["lufs"], r["un_changement_toutes_s"])
            if not garder: os.remove(v)
        except Exception as e:
            print("échec", it["id"], e)
    json.dump(resultats, open(os.path.join(dossier, "mesures.json"), "w", encoding="utf8"), indent=1, ensure_ascii=False)
    lignes = ["# Résumé", "", "| Mesure | Médiane | p10 | p90 |", "|---|---|---|---|"]
    for cle in ("duree_s", "lufs", "luminosite", "contraste", "saturation", "part_fond_bleu", "un_changement_toutes_s", "luminosite_image1"):
        vals = [r[cle] for r in resultats if r.get(cle) is not None]
        if vals: lignes.append(f"| {cle} | {np.median(vals):.3f} | {np.percentile(vals, 10):.3f} | {np.percentile(vals, 90):.3f} |")
    open(os.path.join(dossier, "resume.md"), "w", encoding="utf8").write("\n".join(lignes))
    print("\n".join(lignes))

if __name__ == "__main__":
    main()
