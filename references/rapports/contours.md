# Rapport : contours

## Mesures
- Part des pixels « de bord » (gradient de luminosité > 0,25 sur une image 101×180) : **10,6 %** (8,1-13,5 %).
- C'est beaucoup plus qu'un rendu 3D normal (≈ 4-6 %) : ce sont les traits noirs qui font le style.

## Recette
- `bridge/ink.ts` : traits sur les ruptures de profondeur et les arêtes (> 50°), quasi noirs (#030303).
- Épaisseur ≈ 3,4 px à 6 m → 2,2 px à 90 m (à 1080×1920, ×1,33 en 1440×2560), disparition vers 450 m.
- Les cartes 2D (persos, effets, ciel, fumée) sont sur le calque `NOINK` : pas de rectangle autour.
- Contrôle : sous 8 % → traits plus épais ; au-dessus de 14 % → trop chargé, éloigne la caméra ou simplifie le décor.
