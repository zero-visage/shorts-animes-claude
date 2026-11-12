"""Shorts animés - analyse_mouvement.py
Mesure le RYTHME d'une vidéo (la référence ou la nôtre) : où sont les coupes, combien de temps dure chaque plan,
quand l'image bouge vite (impact, mouvement brusque) ou reste calme. On compare ensuite les deux courbes pour
avoir le même rythme que la référence (même nombre de plans, mêmes moments forts).

usage : python analyse_mouvement.py <video.mp4> <sortie.json> [graphique.png]
        python analyse_mouvement.py --comparer ref.json nous.json      -> écarts de rythme lisibles
Sortie JSON : fps, coupes (s), plans [{debut, fin, duree}], mouvement par image (0 = immobile, 1 = très rapide),
              pics (moments les plus agités).
"""
import sys, os, json, subprocess
import numpy as np

L, H = 90, 160          # on travaille sur une petite version en niveaux de gris : rapide et suffisant

def lire_images(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                        "-of", "csv=p=0", video], capture_output=True, text=True, check=True)
    a, b = r.stdout.strip().split("/"); fps = float(a) / float(b)
    brut = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={L}:{H},format=gray", "-f", "rawvideo", "-"],
                          capture_output=True, check=True).stdout
    images = np.frombuffer(brut, np.uint8).reshape(-1, H, L).astype(np.float32) / 255.0
    return fps, images

def analyser(video):
    fps, im = lire_images(video)
    n = len(im)
    diff = np.zeros(n); histo = np.zeros(n)
    hist_prec = None
    for i in range(n):
        h = np.histogram(im[i], 32, (0, 1))[0].astype(np.float32); h /= h.sum()
        if i:
            diff[i] = np.abs(im[i] - im[i - 1]).mean()
            histo[i] = 0.5 * np.abs(h - hist_prec).sum()
        hist_prec = h
    # coupe = changement brusque de l'image ET de sa répartition de lumière, bien au-dessus du voisinage
    coupes = []
    for i in range(1, n):
        voisins = np.median(diff[max(1, i - 8):i + 9])
        if diff[i] > max(0.06, 3.5 * voisins) and histo[i] > 0.18:
            if not coupes or i - coupes[-1] > 5: coupes.append(i)
    # mouvement à l'intérieur des plans (les coupes ne comptent pas)
    mv = diff.copy()
    for c in coupes: mv[c] = np.median(diff[max(1, c - 3):c + 4])
    lisse = np.convolve(mv, np.ones(5) / 5, "same")
    norm = lisse / (np.percentile(lisse, 98) + 1e-6)
    norm = np.clip(norm, 0, 1)
    bornes = [0] + coupes + [n]
    plans = [{"debut": round(a / fps, 2), "fin": round(b / fps, 2), "duree": round((b - a) / fps, 2)} for a, b in zip(bornes, bornes[1:])]
    pics = [int(i) for i in np.argsort(-norm)[:40]]
    pics_tries = []
    for i in sorted(pics, key=lambda k: -norm[k]):
        if all(abs(i - j) > fps * 0.4 for j in pics_tries): pics_tries.append(i)
        if len(pics_tries) >= 8: break
    return {"video": os.path.basename(video), "fps": fps, "images": n, "duree": round(n / fps, 2),
            "coupes": [round(c / fps, 2) for c in coupes], "plans": plans,
            "duree_moyenne_plan": round(float(np.mean([p["duree"] for p in plans])), 2),
            "mouvement": [round(float(x), 3) for x in norm],
            "pics": sorted(round(i / fps, 2) for i in pics_tries)}

def graphique(res, png):
    try:
        import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    except ImportError:
        print("(matplotlib absent : pas de graphique)"); return
    t = np.arange(len(res["mouvement"])) / res["fps"]
    fig, ax = plt.subplots(figsize=(12, 2.6)); ax.plot(t, res["mouvement"], lw=1)
    for c in res["coupes"]: ax.axvline(c, color="r", lw=0.8)
    ax.set_xlabel("secondes"); ax.set_ylabel("mouvement"); ax.set_title(res["video"] + " - coupes en rouge")
    fig.tight_layout(); fig.savefig(png, dpi=110); plt.close(fig)

def comparer(ref, nous):
    r, m = json.load(open(ref)), json.load(open(nous))
    print(f"Durée : référence {r['duree']} s / nous {m['duree']} s")
    print(f"Plans : référence {len(r['plans'])} (moyenne {r['duree_moyenne_plan']} s) / nous {len(m['plans'])} (moyenne {m['duree_moyenne_plan']} s)")
    print("Coupes de la référence et la nôtre la plus proche :")
    for c in r["coupes"]:
        proche = min(m["coupes"], key=lambda x: abs(x - c)) if m["coupes"] else None
        ecart = "" if proche is None else f"{proche:6.2f} s ({proche - c:+.2f})"
        print(f"  {c:6.2f} s  ->  {ecart}{'   <- à rapprocher' if proche is None or abs(proche - c) > 0.5 else ''}")
    print("Moments les plus agités : référence", r["pics"], "/ nous", m["pics"])
    a = np.array(r["mouvement"]); b = np.array(m["mouvement"])
    k = min(len(a), len(b))
    for s in range(0, int(k / r["fps"]), 2):
        i0, i1 = int(s * r["fps"]), int(min(k, (s + 2) * r["fps"]))
        da, db = a[i0:i1].mean(), b[i0:i1].mean()
        if abs(da - db) > 0.2:
            print(f"  {s}-{s + 2} s : la référence bouge {'plus' if da > db else 'moins'} ({da:.2f} contre {db:.2f})")

if __name__ == "__main__":
    if sys.argv[1] == "--comparer":
        comparer(sys.argv[2], sys.argv[3]); sys.exit()
    res = analyser(sys.argv[1])
    json.dump(res, open(sys.argv[2], "w"), indent=0)
    print(f"{res['duree']} s, {len(res['plans'])} plans (moyenne {res['duree_moyenne_plan']} s), coupes {res['coupes']}")
    print("moments forts :", res["pics"])
    if len(sys.argv) > 3: graphique(res, sys.argv[3])
