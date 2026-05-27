#  La liste des technologies utilisées pour le projet, avec justification (spécifications techniques)

---

## Linter

* **Biome** : linter + formateur de code unifié

---

## Front-end

| Technologie  | Version | Rôle et justification                                                                                                                 |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| React        | 19      | Librairie UI principale, dans la dernière version pour l’utilisation des hooks récents et des dernières fonctionnalités de formulaires |
| TypeScript   | 5       | Typage statique pour fiabiliser le développement, améliorer l’autocomplétion et limiter les erreurs runtime                           |
| Vite         | 8       | Bundler, démarrage rapide du projet et transpilation pour React, dernière version stable                                              |
| Tailwind CSS | 4       | Styling utilitaire, rendu professionnel et clean rapidement                                                                           |
| React Router | 7       | Navigation entre les pages                                                                                                            |
| shadcn/ui | latest | Bibliothèque de composants UI réutilisables basée sur React, Tailwind CSS et Base UI qui est open source, permettant de construire une interface cohérente, accessible et maintenable |

---

## Back-end

| Technologie | Version | Rôle et justification                                                                                                     |
| ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Node.js     | 24 LTS  | Runtime JavaScript serveur, dernière version stable. Choix volontaire de ne pas utiliser Node 26 car version trop récente |
| Express     | 5       | Framework HTTP pour le routing, les middlewares et les contrôleurs                                                        |
| Prisma      | 7       | ORM pour la modélisation de données, les migrations et les requêtes                                                       |
| PostgreSQL  | 18      | Base de données relationnelle adaptée aux relations complexes et aux besoins d’agrégation                                 |
| TypeScript  | 5       | Sécurisation du code back-end grâce au typage statique et meilleure maintenabilité du projet                              |


---

## Documentation et CI/CD
| Outil              | Rôle et justification                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Swagger UI Express | Documentation interactive de l’API REST pour faciliter les tests, la compréhension des endpoints et la maintenance                    |
| Husky              | Mise en place de hooks Git pre-commit afin de lancer automatiquement les vérifications de qualité avant chaque commit                 |
| GitHub Actions | Automatisation de la CI/CD : linting, tests, vérification du build et préparation des workflows de déploiement |



---
## Outils

* JWT (jsonwebtoken) pour l'authentification stateless
* Argon2 pour le hachage des mots de passe
* dotenv pour la gestion des variables d’environnement
* cors pour la gestion des accès cross-origin
* helmet pour la sécurité HTTP (headers)
* Zod pour la validation des données entrantes optimisée pour TypeScript
* Vitest v4 pour les tests
* Adminer pour la visualisation de la BDD
* Git et GitHub pour le versionning et la collaboration
* Docker pour la conteneurisation de l’environnement de développement et de déploiement potentiel
* express-rate-limit pour la limitation du nombre de requêtes afin de protéger l’API contre les abus
* xss-sanitizer pour la protection contre les injections de scripts malveillants dans les entrées utilisateur
* body parser avec limitation de taille des payloads pour éviter les attaques par surcharge de requêtes