---
name: shorts-animes-claude
description: Fabriquer un Short vertical (30-60 s) dans le style « personnages 2D plats dans un monde 3D coloré » avec three.js + Remotion, en français. À utiliser quand on demande un Short cartoon, une histoire vraie racontée avec des personnages 2D dans des décors 3D.
---

# Shorts animés : personnages 2D dans un monde 3D

Exemple complet qui marche : `projet/src/videos/trains/` (« Les trains trop larges », 48 s, 13 plans, 1 452 images).
Copie ce dossier pour chaque nouveau Short et ajoute la composition dans `projet/src/Root.tsx`.

**À lire avant de commencer :** `references/GUIDE_DE_STYLE.md` (les chiffres cibles), puis le rapport du sujet que tu
règles dans `references/rapports/` (mouvement, profondeur, textures, personnages, lumière, contours, couleurs, son),
et `references/ERREURS.md`.

## Règles d'or
- **Chaque phrase est illustrée.** Le Short doit se comprendre sans le son.
- **Chaque action tombe 2 images AVANT son mot** (fonction `W(s)` dans `story.ts`).
- **La caméra ne coupe presque jamais** : elle glisse d'un moment au suivant. Fondu court (6-8 images) seulement quand on change d'endroit.
- **Mesurer, pas deviner.** Ne demande pas « c'est bien ? », mesure (luminosité, saturation, coupes) et compare aux chiffres de `references/GUIDE_DE_STYLE.md`.
- **Vérifier les images de test avant le rendu**, puis la vidéo entière (une image toutes les 0,5 s) après le rendu.

## Étapes

### 1. Histoire et faits
- Un fait **réel** qui sonne **faux**, avec une cause visible (on peut le dessiner).
- Vérifie chaque chiffre dans une source, et note la source en haut du script.
- La meilleure blague vient souvent d'un fait (« Heureusement… / Malheureusement… »).

### 2. Texte (formule mesurée sur 20 Shorts)
1. **Paradoxe dès la première phrase**, sans intro.
2. Le décor en une ligne (année, lieu).
3. Ça monte : 3 à 5 étapes, de plus en plus grosses.
4. La question que tout le monde se pose (« Attends… »).
5. **« Tu vois, »** puis l'explication avec une image de tous les jours (le canapé et la cage d'escalier).
6. Chute ironique courte. La vidéo s'arrête sur le dernier mot.
- Débit : environ 3,7 mots par seconde, presque aucun blanc.

### 3. Voix
- Toujours **avant** l'image. Une seule prise.
- Récupère le temps de chaque mot (`words.json`, n'importe quel outil de transcription avec temps par mot).
- Les sous-titres (2-3 mots, blancs, gras) se génèrent avec `outils/sous_titres.py` → `captions.ts`.

### 4. Plan des plans (`story.ts`)
- `SHOTS` : chaque plan avec ses images de début/fin, sa lumière et son décor.
- `CAMS` : les clés de caméra par plan (`P(position, regard, f, f0, vitesse_de_poussée, fov, roulis)`), avec un léger travelling avant pendant les plans fixes.
- Les moments clés en constantes : `const BLANC = W(15.24)` (« tout blanc » à 15,24 s).
- Change la lumière au moment de l'explication (lumière bleue), puis reviens.

### 5. Décors (`sets.ts`) et objets (`props.ts`)
- Tout est construit en code : boîtes, quads, textures peintes en Canvas (béton, ballast, bois, papier peint…). Aucune image téléchargée.
- Plusieurs décors dans le même monde, à des endroits différents (ex. gare en x = 0, bureau en x = -400, salon en x = -200).
- **Attention :** sépare bien les décors. Un décor posé sur un autre donne des rails qui traversent un bureau.

### 6. Personnages (`cast.ts`)
- Cartes 2D (`bodyFront`) avec 14 expressions : neutral, stern, grin, laugh, whistle, nervous, shock, relief, relief_open, dazed, pained, smile, smile_closed, lick.
- Accessoires : chin (main au menton), scared (mains en l'air), shovel, hammer, lantern.
- Effets 2D : panneaux de texte, flèches, étincelles, « CRAC ! », poussière, points d'exclamation et d'interrogation.
- Habille les personnages selon l'époque (pas de hauts-de-forme en 2014).

### 7. Images de test
```
COMP=TrainsShort node scripts/images-test.mjs out/test_ 100,535,960 0.5
```
Regarde chaque image : cadrage, objets cachés, décors qui se chevauchent, personnages hors champ.

### 8. Rendu
```
node scripts/render.mjs TrainsShort out/trains.mp4
```
Bruitages : `outils/son/bruitages.py` (fabriqués en code, calés sur les images) ou `outils/son/mixer.py` (sons
enregistrés CC0). Puis son à -14 LUFS (`ffmpeg -i out/trains.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 final.mp4`).

### 9. Vérification finale (jamais sauter)
- `python outils/controle/controle_video.py out/final.mp4 chk/final` : planche d'une image toutes les 0,5 s sur TOUTE
  la vidéo, images noires/figées, flashs (objet qui clignote), volume.
- Compare luminosité, contraste, saturation, contours et rythme à `references/GUIDE_DE_STYLE.md` ; écart > 10 % →
  corrige avec le rapport correspondant, refais le rendu, puis `outils/controle/comparer_avant_apres.py` pour prouver le mieux.
- Si tu as une vidéo de référence (étude privée) : `outils/reference/images_reference.py` puis `comparer.py` pour voir
  chaque moment côte à côte, `analyse_mouvement.py` et `analyse_sons.py` pour le rythme et les bruitages.
