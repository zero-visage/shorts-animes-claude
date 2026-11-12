# Rapport : personnages

## Ce qu'on observe
- Personnages **2D plats** (cartes) face caméra, contour sombre, 2-3 couleurs par vêtement.
- Têtes grosses (≈ 1/4 de la hauteur), yeux et bouche simples : l'émotion se lit d'un coup.
- Ils **jouent** : surprise, peur, rire, chute. Une pose différente à chaque phrase importante.
- Ombre de contact sous les pieds, teinte de la lumière de la scène sur la carte.

## Recette
- `bridge/toon.ts` + `cast.ts` : 14 expressions (neutral, stern, grin, laugh, whistle, nervous, shock, relief, relief_open,
  dazed, pained, smile, smile_closed, lick) et accessoires (chin, scared, shovel, hammer, lantern).
- Habille selon l'époque et le lieu (voir `ERREURS.md`).
- Un perso occupe au moins 1/4 de la hauteur dans les plans où il parle ou réagit.
- Ne laisse jamais un perso immobile > 1 s : respiration, clignement, petit rebond.
