# Rapport : couleurs et étalonnage

## Mesures (24 Shorts)
| Mesure | Médiane | p10-p90 |
|---|---|---|
| Saturation (HSV) | 0,43 | 0,37-0,50 |
| Contraste (écart-type de luminosité) | 0,20 | 0,175-0,225 |

Répartition des teintes (pixels assez colorés, par tranches de 30°) :
| Teinte | Part |
|---|---|
| Rouge → orange (0-30°) | 24 % |
| Orange → jaune (30-60°) | 15 % |
| Vert (60-150°) | 7 % |
| Cyan → bleu ciel (150-210°) | 10 % |
| Bleu (210-270°) | 28 % |
| Violet → rose (270-360°) | 14 % |

→ Le style oppose les **chauds** (personnages, toits, briques, feu) au **bleu** (ciel, eau, ombres).

## Recette
- `bridge/grade.ts` : courbe de tons à 7 points, saturation ombres/milieux/hautes lumières, teinte 3 voies, vignette.
- Règle : ombres légèrement bleues, hautes lumières légèrement chaudes ; vignette faible.
- `GRADE_STRENGTH` à baisser si l'éclairage est déjà bon (sinon double correction).
- Contrôle : `python outils/controle/controle_video.py out/short.mp4 chk/` donne luminosité/contraste/saturation à comparer.
