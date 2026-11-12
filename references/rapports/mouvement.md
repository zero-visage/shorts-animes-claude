# Rapport : mouvement et rythme

## Mesures (24 Shorts, 1 image/s, différence moyenne de luminosité entre deux secondes)
| Seuil de changement | Par seconde (médiane) | Ce que ça veut dire |
|---|---|---|
| > 0,12 | 0,70 | l'image bouge presque chaque seconde : la caméra ne s'arrête jamais |
| > 0,18 | 0,34 | un gros changement (nouvel angle, nouvel endroit) toutes les ~3 s |
| > 0,25 | 0,14 | un changement total (coupe vers un décor différent) toutes les ~7 s |

Différence médiane d'une seconde à l'autre : 0,155 (0,135-0,194).
Sur 20 Shorts analysés à 30 i/s : caméra en mouvement ~73 % des images ; 0 à 2 coupes franches dans la moitié des Shorts.

## Recette dans le projet
- Dans `story.ts`, chaque plan a une caméra qui bouge (`P(..., vitesse_de_poussée)`), même lente. Jamais un plan figé > 1 s.
- Change d'endroit ou d'angle toutes les **2,5 à 4 s** ; garde les coupes franches pour les chocs (impact, révélation).
- Fondu court (6-8 images) quand on change de décor sans mouvement qui relie.
- Mesure : `python outils/reference/analyse_mouvement.py out/short.mp4 nous.json`, puis
  `--comparer ref.json nous.json` si tu as mesuré une référence.
