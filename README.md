# Shorts animés avec Claude (gratuit)

Une skill pour que Claude fabrique des Shorts verticaux dans le style **« personnages 2D plats dans un monde 3D coloré »**,
en français : la méthode complète, un guide de style **mesuré sur 44 Shorts du genre**, 8 rapports avec les réglages,
des outils de contrôle, et un projet three.js + Remotion qui marche (le Short « Les trains trop larges », 48 s).

## Ce qu'il y a dedans

| Dossier / fichier | À quoi ça sert |
|---|---|
| `SKILL.md` | La méthode pas à pas que Claude suit. Le fichier le plus important. |
| `references/GUIDE_DE_STYLE.md` | La fiche du style en chiffres : lumière, couleurs, contours, rythme, son. |
| `references/rapports/` | 8 rapports (mouvement, profondeur, textures, personnages, lumière, contours, couleurs, son) : ce qu'on mesure + quoi régler dans le projet. |
| `references/MESURES.md` | Analyse image par image de 20 Shorts (voix, coupes, caméra) + notre Short avant/après. |
| `references/donnees/` | Les mesures brutes (CSV), pour refaire les calculs. |
| `references/ERREURS.md` | Les erreurs déjà faites et comment les éviter. |
| `projet/` | Projet Remotion + three.js prêt à lancer, moteur de rendu + Short des trains en exemple. |
| `outils/reference/` | Mesurer une chaîne, découper une référence en images, comparer ton Short à côté (étude privée). |
| `outils/controle/` | Planche de toute la vidéo (0,5 s), images noires/figées/flashs, volume ; avant/après. |
| `outils/son/` | Bruitages fabriqués en code, ou mix voix + bruitages enregistrés à -14 LUFS. |
| `outils/sous_titres.py` | Sous-titres de 2-3 mots calés sur la voix. |

## Installation (une fois)

1. Installe [Node.js](https://nodejs.org) 20+, [Python](https://www.python.org) 3.10+ et [ffmpeg](https://ffmpeg.org).
2. Python : `pip install numpy pillow` (et `yt-dlp` si tu veux mesurer une chaîne).
3. Copie ce dossier dans les skills de Claude :
   - Claude Code : `~/.claude/skills/shorts-animes-claude/`
   - Ou donne simplement `SKILL.md` à Claude au début de la conversation.
4. Fabrique les bruitages de l'exemple : `python outils/son/bruitages.py` (écrit `projet/public/trains/sfx.wav`).
5. Dans `projet/` : `npm install`, puis `npm run studio` pour voir le Short d'exemple.
6. Mets ta voix dans `projet/public/trains/voice.mp3` (l'exemple est livré sans voix), puis `npm run rendu`.

Puis dis à Claude :

> « Utilise la skill shorts animés et fais-moi un Short sur [ton histoire vraie]. »

## Notes
- **Windows** : dans `projet/scripts/render.mjs`, le chemin de Chrome est celui de Windows ; sur Mac/Linux change `browserExecutable`.
- **Disque** : Remotion écrit beaucoup de fichiers temporaires ; si ton disque système est plein, définis `REMOTION_TMP` vers un autre disque.
- **Carte graphique** : avec une carte récente, 48 s de vidéo sortent en quelques minutes. Sans, ça marche, en plus long.
- **Références** : les outils de `outils/reference/` servent à l'étude privée. Ne republie jamais les vidéos ou images d'une autre chaîne.

## Crédits et licence
- Moteur de rendu (`projet/src/videos/bridge/`) : skill gratuite de **Mr omi**,
  [github.com/mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts), licence MIT
  (voir `LICENSE_mromidev.txt`). Merci à lui.
- Méthode en français, Short des trains, guide de style, rapports, mesures et outils : **Zéro Visage**.
- Licence MIT (voir `LICENSE`).
