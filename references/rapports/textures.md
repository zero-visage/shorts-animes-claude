# Rapport : textures

## Ce qu'on observe
- Surfaces **peintes à la main**, simples : 2-4 teintes proches + quelques taches, jamais de photo.
- Les détails (briques, pavés, planches) servent à lire la matière et l'échelle, pas à faire réaliste.
- Pas de bruit fin : à la taille d'un téléphone, une texture doit se lire en un coup d'œil.

## Recette
- `bridge/paint.ts` dessine tout en Canvas : `grass`, `cobble`, `stone`, `planks`, `water`, `roof`, `brick`, `facade`…
- Fonction `jit()` : variation de teinte douce (±10 % luminosité, ±5° de teinte) pour éviter les aplats morts.
- Répète (`rep`) assez pour que les motifs aient la bonne taille (une brique ≈ 25 cm).
- Aucune texture téléchargée : le projet reste léger et sans problème de licence.
