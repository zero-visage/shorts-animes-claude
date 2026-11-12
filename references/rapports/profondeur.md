# Rapport : profondeur et flou

## Mesures
- Netteté (variance du laplacien ×1000, image 101×180) : **36** (28-45). Plus haut = plus de détails nets.
- Les Shorts les plus « détaillés » (> 45) sont des scènes de foule/ville ; les plus doux (< 28) sont des intérieurs sombres.

## Recette
- `bridge/lensblur.ts` : `focus` = distance du sujet, `cInf` = flou à l'infini (px à 1080×1920), `nearScale` pour l'avant-plan.
- Départ : `cInf` 6-10 en extérieur, 3-5 en intérieur. Le sujet reste net, le fond devient une tache douce dès 20-30 m.
- Brouillard (`fogNear`/`fogFar` dans `lights.ts`) teinté comme l'horizon : il donne la distance sans assombrir.
- Contrôle : si ta netteté mesurée dépasse 45, augmente `cInf` ; sous 28, baisse-le ou rapproche la caméra.
