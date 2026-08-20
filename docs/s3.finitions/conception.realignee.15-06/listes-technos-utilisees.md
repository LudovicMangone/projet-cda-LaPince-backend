# Technologies utilisées — La Pince

> Version mise à jour post-développement (15/06/2026).

---

## Linter / Formateur

- **Biome** — linter + formateur de code unifié (remplace ESLint + Prettier)
- **Husky** — hooks Git pre-commit pour lancer Biome automatiquement avant chaque commit

---

## Front-end

| Technologie | Version | Rôle et justification |
|---|---|---|
| React | 19 | Librairie UI principale — SPA avec composants déclaratifs et gestion d'état |
| TypeScript | 5 | Typage statique pour fiabiliser le développement et limiter les erreurs runtime |
| Vite | 8 | Bundler — démarrage rapide du projet et transpilation pour React |
| Tailwind CSS | 4 | Styling utilitaire — rendu professionnel et cohérent rapidement |
| React Router | 7 | Navigation entre les pages (routes publiques et privées) |
| Base UI / shadcn | latest | Composants UI accessibles et stylisables (Dialog, Select, Tabs, Slider…) |
| TanStack Query | latest | Gestion du cache serveur et des requêtes asynchrones (data fetching, invalidation) |
| Sonner | latest | Système de notifications toast (feedback visuel des actions utilisateur) |
| lucide-react | 0.x | Bibliothèque d'icônes SVG légère et cohérente |

---

## Back-end

| Technologie | Version | Rôle et justification |
|---|---|---|
| Node.js | 24 LTS | Runtime JavaScript serveur |
| Express | 5 | Framework HTTP pour le routing, les middlewares et les contrôleurs |
| Prisma | 7 | ORM — modélisation des données, migrations, requêtes typées |
| PostgreSQL | 18 | Base de données relationnelle — gestion des relations complexes et des agrégations |
| TypeScript | 5 | Typage statique côté back — cohérence des contrats de données entre les couches |

---

## Sécurité & validation

| Outil | Rôle |
|---|---|
| Zod 4 | Validation et typage des données entrantes  |
| Argon2 | Hachage des mots de passe |
| jsonwebtoken (JWT) | Authentification stateless — token valable 7 jours |
| helmet | Sécurisation des headers HTTP |
| express-xss-sanitizer | Protection contre les injections XSS dans les entrées utilisateur |
| express-rate-limit | Limitation du nombre de requêtes (protection DDoS / brute-force basique) |
| cors | Gestion des accès cross-origin |

---

## Tests

| Outil | Rôle |
|---|---|
| Vitest 4 | Framework de tests — tests unitaires et tests d'intégration (configs séparées) |

---

## Documentation & CI/CD

| Outil | Rôle |
|---|---|
| Swagger UI Express + swagger-jsdoc | Documentation interactive de l'API REST |
| GitHub Actions | CI : linting, tests unitaires et d'intégration, vérification du build |
| Docker Compose | Conteneurisation de l'environnement de développement (back + PostgreSQL) |
| Railway | Hébergement back-end et base de données PostgreSQL (production) |
| Vercel | Hébergement front-end (production) |

---

## Outils de développement

| Outil | Rôle |
|---|---|
| Adminer | Interface graphique pour inspecter la base de données en dev |
| REST Client (fichiers `.http`) | Tests d'endpoints directement depuis VSCode |
| Git + GitHub | Versionning et collaboration (GitHub Projects v2 pour la gestion de projet) |
| Docker / Lazydocker | Conteneurisation et monitoring terminal des containers |
| dotenv | Gestion des variables d'environnement |
