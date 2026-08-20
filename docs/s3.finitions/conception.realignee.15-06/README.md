# Documentation de conception réalignée — 15 juin 2026

Ce dossier contient la documentation de conception **mise à jour en fin de projet**, après la
démonstration finale du 15/06/2026, pour la rendre conforme à l'application réellement livrée.

## Pourquoi deux versions coexistent

`docs/s0.conception/` conserve la documentation **telle qu'elle a été produite au Sprint 0**,
avant le développement. Ce dossier-ci en donne la version réalignée sur le code livré.

Les deux sont conservées volontairement : l'écart entre elles est la trace du travail de
conception réel, et il est documenté sous forme de tableau des écarts dans le dossier de projet
(annexe C). Écraser la version d'origine aurait effacé cette trace.

## Contenu

| Fichier | Ce qui a changé par rapport au Sprint 0 |
|---|---|
| `MPD.md` | Script de création complet, synchronisé avec le schéma Prisma : enum `project_type`, timestamps sur les tables principales, `is_amount_calculated` et `is_repartition_amount_calculated`, statut d'alerte `resolved`, `repartition_amount >= 0`, budget global unique par projet |
| `MCD.md` / `MCD.pdf` | Modèle conceptuel réaligné (source Mocodo + rendu) : le budget est rattaché au projet, plus à la catégorie |
| `use-cases.md` | Cas d'utilisation réécrits sur le comportement livré (calcul des parts côté front, vérification du seuil et résolution automatique des alertes) |
| `liste-routes-api.md` | Routes synchronisées avec les routers Express et les appels réels du front |
| `user-stories.md` | User stories mises à jour sur le périmètre effectivement livré |
| `listes-technos-utilisees.md` | Versions des dépendances telles que livrées |

## Provenance et dates

Le réalignement a été effectué le **15/06/2026** dans le dépôt documentaire de l'équipe, tenu
séparément des dépôts de code (commits `af401f0`, `d0ba8ef` et `a57b2a7` du 15/06). Chaque
fichier en porte la marque dans son en-tête : « Version mise à jour post-développement
(15/06/2026) ».

Ces documents sont **importés ici en août 2026**, à l'occasion de la constitution du dossier
professionnel, afin que la documentation de conception vive avec le code qu'elle décrit et
soit consultable sans accès au dépôt documentaire de l'équipe. Le contenu n'a pas été modifié
lors de l'import ; seul l'emplacement change.

Auteur des documents de ce dossier : Ludovic Mangone (Scrum Master). Le MPD a été rédigé par la
Lead Dev au Sprint 0 puis réaligné par mes soins ; le MCD a été co-conçu en binôme avec elle.
