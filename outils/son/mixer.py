"""Shorts animés - mixer.py
Mélange la voix + les bruitages, chacun calé sur SON image (30 i/s), à un niveau réglé PAR RAPPORT À LA VOIX.
Pas de musique, pas de fond continu. Les bruitages baissent un peu quand la voix parle. Sortie à -14 LUFS, pic sous -1 dB.

usage : python mixer.py <cues.json> [sortie.wav=audio/mix.wav]
cues.json :
{
  "voix": "audio/voix.wav", "duree": 29.5, "bibliotheque": "sfx/lib",
  "niveau_par_defaut": -7,                       <- dB sous la voix (Shorts animés : -6 à -7 ; on entend bien les effets)
  "baisse_sous_voix": 3,                         <- dB en moins pendant que la voix parle
  "sons": [
    {"image": 8,  "son": "tir_pistolet", "niveau": -5, "ancre": "attaque"},
    {"image": 60, "son": "whoosh_court", "pan": -0.3, "ancre": "pic"},
    {"image": 180, "son": "impact_metal", "vitesse": 0.85, "coupe": 200, "passe_bas": 1200}
  ]
}
- ancre : "attaque" (le début du son tombe sur l'image), "pic" (le moment le plus fort), "debut" (le tout début du fichier)
- vitesse < 1 : plus lent et plus grave (gros impacts, ralentis) ; pan : -1 gauche, +1 droite
- coupe : image où le son est arrêté ; passe_bas : adoucit un son trop aigu (Hz)
Sorties : <sortie>.wav (mix), audio/voix_seule_14.wav, audio/effets_seuls.wav + un rapport des niveaux.
"""
import os, sys, json, subprocess, wave
import numpy as np

SR = 48000

def charger(p):
    if not p.lower().endswith(".wav") or not os.path.exists(p):
        src = p if os.path.exists(p) else os.path.splitext(p)[0] + ".mp3"
        p2 = os.path.splitext(p)[0] + "_48k.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", str(SR), p2], check=True); p = p2
    w = wave.open(p); sr, ch, n, sw = w.getframerate(), w.getnchannels(), w.getnframes(), w.getsampwidth()
    a = np.frombuffer(w.readframes(n), {2: np.int16, 4: np.int32}[sw]).astype(np.float32).reshape(-1, ch).mean(axis=1)
    a /= 32768.0 if sw == 2 else 2147483648.0
    if sr != SR: a = np.interp(np.arange(0, len(a) * SR / sr) * sr / SR, np.arange(len(a)), a).astype(np.float32)
    return a

def db(x): return 20 * np.log10(max(float(x), 1e-9))

def ecrire(p, a):
    os.makedirs(os.path.dirname(p) or ".", exist_ok=True)
    w = wave.open(p, "wb"); w.setnchannels(2 if a.ndim == 2 else 1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()

def mesure_lufs(p):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    l = r[r.rindex("Integrated loudness"):].splitlines()
    return next(float(x.split()[1]) for x in l if x.strip().startswith("I:")), next(float(x.split()[1]) for x in l if x.strip().startswith("Peak:"))

def normaliser(src, dst, cible=-14.0, plafond=-2.3):
    """gain vers -14 LUFS + limiteur doux (le pic reste sous -1 dB même après la compression AAC)"""
    g = cible - mesure_lufs(src)[0]
    for _ in range(8):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
                        f"volume={g:.2f}dB,alimiter=limit={10 ** (plafond / 20):.4f}:attack=3:release=60:level=false",
                        "-ar", str(SR), dst], check=True)
        e = cible - mesure_lufs(dst)[0]
        if abs(e) < 0.1: break
        g += 1.3 * e

def mixer(cues_path, sortie="audio/mix.wav"):
    C = json.load(open(cues_path, encoding="utf8"))
    lib = C.get("bibliotheque", "sfx/lib"); duree = C["duree"]; N = int(duree * SR)
    voix = charger(C["voix"])[:N]
    env = np.sqrt(np.convolve(voix ** 2, np.ones(2400) / 2400, "same"))
    V_RMS = db(np.sqrt((voix[env > env.max() * 0.1] ** 2).mean())); V_PIC = db(np.abs(voix).max())
    baisse = 10 ** (-C.get("baisse_sous_voix", 3) / 20)
    duck = 1.0 - (1 - baisse) * np.clip(env / (env.max() * 0.25), 0, 1)
    duck = np.convolve(duck, np.ones(4800) / 4800, "same")
    mix = np.zeros((N, 2), np.float32); fx = np.zeros_like(mix)
    mix[:len(voix)] += voix[:, None]
    cache = {}
    for c in C["sons"]:
        nom = c["son"]
        if nom not in cache: cache[nom] = charger(os.path.join(lib, nom + ".wav"))
        a = cache[nom].copy()
        v = c.get("vitesse", 1.0)
        if v != 1.0: a = np.interp(np.arange(0, len(a) - 1, v), np.arange(len(a)), a).astype(np.float32)
        e = np.abs(a); pk = e.max() + 1e-9
        actif = a[e > pk * 0.03]
        niveau = c.get("niveau", C.get("niveau_par_defaut", -7))
        g = 10 ** ((V_RMS + niveau - db(np.sqrt((actif ** 2).mean()))) / 20)
        g = min(g, 10 ** ((V_PIC - 3.0 - db(pk)) / 20))          # jamais plus fort que les pics de la voix
        a *= g
        if c.get("passe_bas"):
            k = np.exp(-2 * np.pi * c["passe_bas"] / SR); y = np.zeros_like(a); acc = 0.0
            for i in range(len(a)): acc = (1 - k) * a[i] + k * acc; y[i] = acc
            a = y
        dec = {"attaque": int(np.argmax(e > pk * 0.25)), "pic": int(np.argmax(e)), "debut": 0}[c.get("ancre", "attaque")]
        o = int(c["image"] / 30.0 * SR) - dec
        if o < 0: a = a[-o:]; o = 0
        if c.get("fondu_entree"): n = min(int(c["fondu_entree"] * SR), len(a)); a[:n] *= np.linspace(0, 1, n)
        if c.get("coupe") is not None:
            fin = int(c["coupe"] / 30.0 * SR) - o
            if 0 < fin < len(a): a = a[:fin].copy(); n = min(240, len(a)); a[-n:] *= np.linspace(1, 0, n)
        n = min(int(c.get("fondu_sortie", 0.05) * SR), len(a)); a[-n:] *= np.linspace(1, 0, n) ** 1.5
        a = a[:max(0, N - o)]
        p = c.get("pan", 0.0); gl, gr = np.sqrt((1 - p) / 2) * 1.41, np.sqrt((1 + p) / 2) * 1.41
        fx[o:o + len(a), 0] += a * gl; fx[o:o + len(a), 1] += a * gr
    fx *= duck[:N, None]; mix += fx
    f = int(0.3 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
    brut = sortie.replace(".wav", "_brut.wav"); ecrire(brut, mix); ecrire("audio/effets_seuls.wav", fx)
    normaliser(brut, sortie); os.remove(brut)
    v_cut = "audio/_voix_coupee.wav"; ecrire(v_cut, voix); normaliser(v_cut, "audio/voix_seule_14.wav"); os.remove(v_cut)
    fe = np.sqrt(np.convolve(fx.mean(axis=1) ** 2, np.ones(4800) / 4800, "same"))
    I, P = mesure_lufs(sortie)
    print(f"mix : {I:.1f} LUFS, pic {P:.1f} dB -> {sortie}")
    print(f"voix {V_RMS:.1f} dBFS ; effet le plus fort {db(fe.max()) - V_RMS:+.1f} dB / voix ; "
          f"effets en médiane {db(np.median(fe[fe > 1e-4])) - V_RMS:+.1f} dB / voix (cible Shorts animés : -6 à -7)")

if __name__ == "__main__":
    mixer(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "audio/mix.wav")
