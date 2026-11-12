# Rapport : son

## Mesures
- Volume : **-14,0 LUFS** (médiane de 24 Shorts ; -15 à -14). Normalise toujours à -14 LUFS, pic sous -1 dB.
- La voix est devant tout le reste ; les bruitages arrivent sur chaque action (chute, choc, whoosh de caméra, pop de texte).

## Recette
- **Sans fichiers son** : `outils/son/bruitages.py` fabrique les bruitages en code (numpy), calés sur les images (30 i/s).
  Copie-le, change la liste des `put(son, temps, gain)` selon ton `story.ts`.
- **Avec des sons enregistrés** (Freesound CC0 conseillé, crédite-les) : `outils/son/mixer.py cues.json` mélange voix +
  bruitages à -6/-7 dB sous la voix, baisse les bruitages pendant que la voix parle, sort à -14 LUFS.
- Mesure une référence (privée) : `outils/reference/analyse_sons.py ref.mp4 ref_sons.json`, puis la tienne, puis `--comparer`.
- Pas de musique obligatoire : si tu en mets une, très bas (-20 dB sous la voix) et libre de droits.
