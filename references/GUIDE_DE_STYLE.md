# Guide de style (mesuré, pas deviné)

Chiffres tirés de **44 Shorts du genre** « personnages 2D plats dans un monde 3D coloré » :
- 20 Shorts analysés image par image (voix, coupes, caméra, couleur) → `MESURES.md` ;
- 24 Shorts récents mesurés en 1 image/s (couleur, contours, netteté, rythme, volume) → `donnees/mesures_24_shorts.csv`.

Aucune image d'une autre chaîne n'est livrée ici : seulement des nombres. Pour voir une référence à côté de ton Short,
fabrique toi-même les planches avec `outils/reference/` (étude privée, jamais republiée).

## La fiche en 1 minute
| Quoi | Cible | Fourchette (p10-p90) | Rapport |
|---|---|---|---|
| Durée | 60 s | 40-66 s | — |
| Volume | -14 LUFS, pic sous -1 dB | -15 à -14 | `rapports/son.md` (via `outils/son/`) |
| Voix | 3,6-3,7 mots/s, presque aucun blanc | 3,3-3,9 | `MESURES.md` |
| Luminosité moyenne (0-1) | 0,45 | 0,40-0,54 | `rapports/lumiere.md` |
| Contraste (écart-type) | 0,20 | 0,175-0,225 | `rapports/couleurs.md` |
| Saturation (HSV) | 0,43 | 0,37-0,50 | `rapports/couleurs.md` |
| Couleurs dominantes | rouges-oranges-jaunes 39 %, bleus 38 % | — | `rapports/couleurs.md` |
| Contours (pixels de bord, image 101×180) | 10,6 % | 8,1-13,5 % | `rapports/contours.md` |
| Netteté (laplacien ×1000) | 36 | 28-45 | `rapports/profondeur.md` |
| L'image change | presque chaque seconde (caméra toujours en mouvement) | — | `rapports/mouvement.md` |
| Gros changement (nouvel endroit / coupe) | 1 toutes les 3 s | 1 / 2,5 à 1 / 4 s | `rapports/mouvement.md` |
| Coupes franches | rares : 0-2 dans la moitié des Shorts | — | `rapports/mouvement.md` |

## Les 10 règles qui font « le look »
1. **Monde 3D, personnages 2D** : décors en volume avec ombres ; personnages en cartes plates, toujours face caméra.
2. **Contours noirs épais** sur le monde (3-4 px à 1080×1920 de près, plus fins au loin) ; jamais de rectangle autour des cartes.
3. **Deux tons de lumière** : face éclairée chaude, face à l'ombre bleutée (pas noire). Ombre de contact sous chaque perso.
4. **Ciel bleu dégradé** (horizon clair, haut plus soutenu) dans la plupart des plans extérieurs.
5. **Couleurs vives mais pas fluo** : saturation 0,43 ; les rouges/oranges portent l'action, le bleu du ciel calme l'image.
6. **Fond flou, sujet net** : profondeur de champ douce dès 20-30 m.
7. **La caméra glisse en permanence** (travelling, grue, poussée lente) ; on change d'endroit environ toutes les 3 s.
8. **Une idée = une image** : chaque phrase de la voix a son action à l'écran, 2 images AVANT le mot.
9. **Lumière qui raconte** : plus sombre/bleue pendant l'explication (60-70 % de la vidéo), puis retour au jour.
10. **Son** : voix devant, bruitages courts sur chaque action, mix à -14 LUFS.

## Comment s'en servir
1. Avant le rendu : images de test → `python outils/controle/controle_video.py` sur un aperçu → compare à la fiche.
2. Écart > 10 % sur luminosité/saturation/contraste → corrige la lumière (`lights.ts`) ou l'étalonnage (`grade.ts`), pas au hasard.
3. Après le rendu : planche toutes les 0,5 s + mesures, puis `outils/reference/comparer.py` contre ta propre référence.
