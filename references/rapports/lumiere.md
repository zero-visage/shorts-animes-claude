# Rapport : lumière

## Mesures
- Luminosité moyenne : **0,45** (0,40-0,54). Les Shorts sont clairs mais pas délavés.
- Bord de l'image (moyenne des 4 px du bord) : gris neutre (≈ 107, 97, 108 / 255) : beaucoup de ciel et de sol, pas de vignette forte.
- Sur 20 Shorts : la lumière baisse vers 60-70 % de la vidéo (l'explication), puis remonte.

## Recette
- `bridge/lights.ts` : préréglages `day` et `golden` ; le soleil est fixé par plan par rapport à la caméra
  (`az` 90-140° = lumière de côté, la plus lisible).
- `lit` chaud, `shade` bleuté, `lift` pour que les ombres ne soient jamais noires.
- Ajoute un préréglage « explication » plus bleu et ~15 % plus sombre (exemple dans `projet/src/videos/trains/lights.ts`).
- Contrôle : luminosité mesurée hors 0,40-0,54 → ajuste `sunI`/`hemiI` avant de toucher à l'étalonnage.
