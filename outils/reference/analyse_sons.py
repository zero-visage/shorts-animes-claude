"""Shorts animés - analyse_sons.py
Écoute la bande son d'une vidéo (la référence, ou notre mix) et sort la LISTE DES BRUITAGES :
à quel moment, combien de temps, quelle force par rapport à la voix, et de quel type (grave/sourd, aigu/métallique,
souffle/whoosh, claquement court...). On s'en sert pour refaire le même genre de design sonore avec des sons libres.

usage : python analyse_sons.py <video_ou_audio> <sortie.json>
        python analyse_sons.py --comparer ref.json nous.json
Rien n'est copié : on ne garde que des mesures (temps, niveaux, type), jamais l'audio de la référence.
"""
import sys, os, json, subprocess
import numpy as np

SR = 22050
TROU = 0.010   # 10 ms par tranche d'analyse

def lire_audio(chemin):
    brut = subprocess.run(["ffmpeg", "-v", "error", "-i", chemin, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                          capture_output=True, check=True).stdout
    return np.frombuffer(brut, np.float32).copy()

def db(x): return 20 * np.log10(np.maximum(x, 1e-9))

def tranches(a, n):
    k = len(a) // n
    return a[:k * n].reshape(k, n)

def bandes(seg):
    """énergie dans 4 bandes : grave (<250 Hz), médium (250-2k), aigu (2k-6k), très aigu (>6k)"""
    sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2
    f = np.fft.rfftfreq(len(seg), 1 / SR)
    tot = sp.sum() + 1e-12
    return [sp[(f < 250)].sum() / tot, sp[(f >= 250) & (f < 2000)].sum() / tot,
            sp[(f >= 2000) & (f < 6000)].sum() / tot, sp[(f >= 6000)].sum() / tot]

def type_son(duree, b, platitude):
    grave, medium, aigu, tres_aigu = b
    if duree < 0.12 and (aigu + tres_aigu) > 0.45: return "claquement/tic aigu (métal, verre, pop)"
    if duree < 0.15: return "impact court"
    if grave > 0.55: return "grave/sourd (boum, coup, battement, souffle grave)"
    if platitude > 0.35 and duree > 0.25: return "souffle/whoosh (bruit large qui monte ou descend)"
    if (aigu + tres_aigu) > 0.5: return "aigu/métallique (frottement, tintement, sifflement)"
    return "médium (frottement, glissement, squish, organique)"

def periodicite(seg):
    """0 = bruit (frottement, impact, whoosh), 1 = son voisé très régulier (voix, note tenue)"""
    s = seg[:2048] - seg[:2048].mean()
    if len(s) < 2048 or np.abs(s).max() < 1e-5: return 0.0
    ac = np.correlate(s, s, "full")[len(s) - 1:]; ac /= ac[0] + 1e-12
    lo, hi = int(SR / 400), int(SR / 70)                       # hauteur de voix entre 70 et 400 Hz
    return float(ac[lo:hi].max())

def voix_presente(seg):
    """la voix : énergie surtout entre 250 et 2000 Hz ET très périodique"""
    b = bandes(seg)
    return b[1] > 0.35 and periodicite(seg) > 0.5

def analyser(chemin):
    a = lire_audio(chemin)
    n = int(SR * TROU)
    T = tranches(a, n)
    rms = np.sqrt((T ** 2).mean(axis=1)); niveau = db(rms)
    # flux spectral : apparition d'un son nouveau (attaque)
    fen = 1024
    spec = []
    for i in range(len(T)):
        s = a[i * n:i * n + fen]
        if len(s) < fen: s = np.pad(s, (0, fen - len(s)))
        spec.append(np.abs(np.fft.rfft(s * np.hanning(fen))))
    spec = np.array(spec)
    flux = np.maximum(spec[1:] - spec[:-1], 0).sum(axis=1); flux = np.concatenate([[0], flux])
    flux /= (np.percentile(flux, 99) + 1e-9)
    seuil = np.convolve(flux, np.ones(50) / 50, "same") * 1.8 + 0.12
    attaques = [i for i in range(2, len(flux) - 1) if flux[i] > seuil[i] and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]]
    attaques = [i for k, i in enumerate(attaques) if k == 0 or i - attaques[k - 1] > 6]   # au moins 60 ms d'écart
    # niveau de référence de la voix : médiane du niveau quand ça parle
    parle = [i for i in range(0, len(T), 5) if niveau[i] > np.percentile(niveau, 40) and voix_presente(a[i * n:i * n + 2048])]
    niveau_voix = float(np.median(niveau[parle])) if parle else float(np.percentile(niveau, 70))
    evenements = []
    for i in attaques:
        # fin : quand le niveau retombe de 12 dB sous le pic
        k = i + int(np.argmax(niveau[i:i + 40])); pic = niveau[k]; j = k
        while j < len(niveau) - 1 and niveau[j] > pic - 12 and j - i < 300: j += 1
        seg = a[i * n:max(j * n, i * n + 2048)]
        b = bandes(seg[:8192])
        sp = np.abs(np.fft.rfft(seg[:4096] * np.hanning(len(seg[:4096])))) + 1e-9
        platitude = float(np.exp(np.log(sp).mean()) / sp.mean())
        d = (j - i) * TROU
        sous_voix = voix_presente(a[i * n:i * n + 2048])
        # attaque qui n'est qu'une syllabe de la voix : on l'ignore (sauf si très aiguë = vrai bruitage par-dessus)
        if sous_voix and (b[2] + b[3]) < 0.25 and periodicite(a[i * n:i * n + 2048]) > 0.6: continue
        evenements.append({"t": round(i * TROU, 2), "duree": round(d, 2), "niveau_vs_voix_db": round(float(pic - niveau_voix), 1),
                           "type": type_son(d, b, platitude), "pendant_la_voix": bool(sous_voix),
                           "bandes": [round(float(x), 2) for x in b]})
    musique = float(np.mean(niveau > niveau_voix - 25))   # proportion du temps où il y a toujours du son (fond continu ?)
    return {"fichier": os.path.basename(chemin), "duree": round(len(a) / SR, 2), "niveau_voix_db": round(niveau_voix, 1),
            "bruitages": evenements, "nombre": len(evenements),
            "par_seconde": round(len(evenements) / (len(a) / SR), 2),
            "fond_continu_probable": musique > 0.95}

def comparer(ref, nous):
    r, m = json.load(open(ref)), json.load(open(nous))
    print(f"Bruitages : référence {r['nombre']} ({r['par_seconde']}/s) / nous {m['nombre']} ({m['par_seconde']}/s)")
    lr = np.median([e["niveau_vs_voix_db"] for e in r["bruitages"]]) if r["bruitages"] else 0
    lm = np.median([e["niveau_vs_voix_db"] for e in m["bruitages"]]) if m["bruitages"] else 0
    print(f"Niveau médian des bruitages par rapport à la voix : référence {lr:+.1f} dB / nous {lm:+.1f} dB")
    if lm < lr - 3: print("  -> nos bruitages sont trop bas : remonter d'environ", round(lr - lm), "dB")
    if lm > lr + 3: print("  -> nos bruitages sont trop forts : baisser d'environ", round(lm - lr), "dB")
    print("Bruitages de la référence sans équivalent chez nous (à moins de 0,3 s) :")
    for e in r["bruitages"]:
        if not any(abs(x["t"] - e["t"]) < 0.3 for x in m["bruitages"]):
            print(f"  {e['t']:6.2f} s  {e['duree']:.2f} s  {e['niveau_vs_voix_db']:+.1f} dB  {e['type']}")

if __name__ == "__main__":
    if sys.argv[1] == "--comparer":
        comparer(sys.argv[2], sys.argv[3]); sys.exit()
    res = analyser(sys.argv[1])
    json.dump(res, open(sys.argv[2], "w"), indent=1, ensure_ascii=False)
    print(f"{res['nombre']} bruitages en {res['duree']} s ; voix à {res['niveau_voix_db']} dB ; fond continu : {res['fond_continu_probable']}")
    for e in res["bruitages"]:
        print(f"  {e['t']:6.2f} s  {e['duree']:.2f} s  {e['niveau_vs_voix_db']:+6.1f} dB  {e['type']}")
