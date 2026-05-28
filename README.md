# La Pince — Back-end

> Application web de gestion financière personnelle et collaborative.
> Ce repository contient l'API REST du projet — Node.js, Express 5, Prisma, PostgreSQL.

---

## 📑 Sommaire

- [La Pince — Back-end](#la-pince--back-end)
  - [📑 Sommaire](#-sommaire)
  - [Présentation](#présentation)
  - [Architecture](#architecture)
  - [Stack technique](#stack-technique)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
    - [1. Cloner le repository](#1-cloner-le-repository)
    - [2. Installer les dépendances](#2-installer-les-dépendances)
    - [3. Configurer les variables d'environnement](#3-configurer-les-variables-denvironnement)
    - [4. Lancer l'environnement Docker](#4-lancer-lenvironnement-docker)
    - [5. Appliquer les migrations et le seed](#5-appliquer-les-migrations-et-le-seed)
    - [6. L'API est disponible](#6-lapi-est-disponible)
  - [Variables d'environnement](#variables-denvironnement)
  - [Scripts disponibles](#scripts-disponibles)
  - [Structure du projet](#structure-du-projet)
  - [Base de données](#base-de-données)
    - [Modèles principaux](#modèles-principaux)
  - [Routes API](#routes-api)
    - [Résumé des endpoints](#résumé-des-endpoints)
  - [Tests](#tests)
  - [Qualité de code](#qualité-de-code)
  - [Documentation](#documentation)
  - [RGPD](#rgpd)
- [La Pince — Back-end *(English version)*](#la-pince--back-end-english-version)
  - [Overview](#overview)
  - [Architecture](#architecture-1)
  - [Tech stack](#tech-stack)
    - [Security](#security)
  - [Setup](#setup)
  - [Scripts](#scripts)
  - [API](#api)
  - [Database](#database)
  - [Tests](#tests-1)
  - [Docs](#docs)

---

## Présentation

**La Pince** est une application de gestion financière personnelle et collaborative permettant de :

- Suivre ses dépenses par projet et par catégorie
- Répartir les dépenses entre plusieurs participants
- Définir des budgets et recevoir des alertes en cas de dépassement
- Calculer automatiquement les remboursements entre participants

Ce repository contient exclusivement la **couche back-end** : API REST, logique métier, accès aux données.
Le repository front-end est disponible ici : [`la-pince.client`](https://github.com/O-clock-Helsinki/projet-cda-LaPince-frontend)

---

## Architecture

Le projet adopte une **architecture 3 tiers** séparant clairement :

```
Client (React)          →   Présentation
API REST (Express)      →   Logique métier
PostgreSQL (Prisma)     →   Données
```

Les deux repositories sont indépendants — pas de monorepo.

Le back-end applique les principes de **Separation of Concerns (SoC)** en couches :

```
src/
├── routes/        → définition des endpoints
├── controllers/   → traitement des requêtes et réponses HTTP
├── services/      → logique métier pure
├── middlewares/   → auth, validation, gestion des erreurs
├── schemas/       → validation des données entrantes (Zod)
└── lib/           → utilitaires partagés (Prisma client, erreurs custom...)
```

> 📄 Détail complet des choix d'architecture : [`docs/architecture.md`](docs/s0.conception/cahier.des.charges/choix.architecture.md)

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Node.js | 24 LTS | Runtime JavaScript serveur |
| Express | 5 | Framework HTTP — routing, middlewares, controllers |
| TypeScript | 5 | Typage statique — fiabilité et maintenabilité |
| PostgreSQL | 18 | Base de données relationnelle |
| Prisma | 7 | ORM — modélisation, migrations, requêtes |
| Docker | - | Conteneurisation de l'environnement de développement |
| Zod | 4 | Validation des données entrantes |
| Argon2 | - | Hachage des mots de passe |
| JWT | - | Authentification stateless |
| Helmet | - | Sécurité HTTP (headers) |
| CORS | - | Gestion des accès cross-origin |
| express-rate-limit | - | Protection contre les abus de l'API |
| express-xss-sanitizer | - | Protection contre les injections XSS |
| Biome | 2 | Linter + formatter unifié |
| Husky | - | Hooks Git pre-commit |
| Vitest | 4 | Tests unitaires et d'intégration |
| Swagger UI | - | Documentation interactive de l'API |
| Adminer | - | Interface de visualisation de la base de données |

> 📄 Justification complète des choix techniques : [`docs/specifications-techniques.md`](docs/s0.conception/cahier.des.charges/listes.technos.utilisees.md)

---

## Prérequis

Avant de démarrer, assure-toi d'avoir installé :

- [Docker](https://www.docker.com/) et Docker Compose
- [Node.js 24 LTS](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

---

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/O-clock-Helsinki/projet-cda-LaPince-backend.git
cd projet-cda-LaPince-backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
cp .dockerignore.example .dockerignore
```

### 4. Lancer l'environnement Docker

```bash
npm run docker:up
```

Lance les containers : API Express, PostgreSQL et Adminer.

### 5. Appliquer les migrations et le seed

```bash
npm run db:migrate
npm run db:seed
```

### 6. L'API est disponible

```
http://localhost:3000
```

Adminer (visualisation BDD) :

```
http://localhost:8080
```

---

## Variables d'environnement

Copie `.env.example` en `.env` et renseigne les valeurs.

Idem pour le `.dockerignore.example` en `.dockerignore`



> 📄 Voir `.env.example` pour la liste complète des variables attendues.

| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port de l'API | `3000` |
| `NODE_ENV` | Environnement | `development` |
| `DATABASE_URL` | URL de connexion Prisma | `postgresql://...` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `lapince_user` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `lapince_password` |
| `POSTGRES_DB` | Nom de la base | `lapince_db` |
| `JWT_SECRET` | Clé secrète JWT | `votre_secret` |
| `ADMINER_LOCAL_PORT` | Port Adminer exposé | `8080` |

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre l'API en mode développement avec rechargement automatique |
| `npm run docker:up` | Lance les containers Docker (API + BDD + Adminer) |
| `npm run docker:down` | Arrête les containers Docker |
| `npm run db:migrate` | Applique les migrations Prisma |
| `npm run db:seed` | Insère les données de seed (catégories...) |
| `npm run db:reset` | Réinitialise la base de données |
| `npm run db:generate` | Régénère le client Prisma |
| `npm run lint` | Analyse le code avec Biome |
| `npm run lint:fix` | Corrige les erreurs de lint automatiquement |
| `npm run format` | Formate le code avec Biome |
| `npm run check` | Lint + format en une commande |
| `npm run test:unit` | Lance les tests unitaires |
| `npm run test:integration` | Lance les tests d'intégration |

---

## Structure du projet

```
projet-cda-LaPince-backend/
├── prisma/
│   ├── migrations/          ← historique des migrations
│   ├── seed.ts              ← données initiales (catégories)
│   └── schema.prisma        ← modèle de données
├── src/
│   ├── config/              ← configuration (env, cors...)
│   ├── controllers/         ← traitement des requêtes HTTP
│   ├── middlewares/         ← auth, validation, erreurs, rate limiter
│   ├── routes/              ← définition des endpoints
│   ├── services/            ← logique métier pure
│   ├── schemas/             ← schémas de validation Zod
│   ├── lib/                 ← prisma client, classes d'erreurs custom
│   └── app.ts               ← configuration Express principale
├── tests/
│   ├── unit/
│   └── integration/
├── docs/                    ← documentation du projet
├── generated/               ← client Prisma généré (ne pas modifier)
├── .env.example
├── .gitignore
├── biome.json
├── docker-compose-dev.yml
├── package.json
└── tsconfig.json
```

> 📄 Schéma visuel de l'arborescence : [`docs/arborescence.png`](docs/s0.conception/conception/arborescence_front_end.PNG)

---

## Base de données

Le projet utilise **PostgreSQL 18** avec **Prisma 7** comme ORM.

### Modèles principaux

| Table | Description |
|---|---|
| `app_user` | Comptes utilisateurs |
| `project` | Projets de dépenses (voyage, coloc...) |
| `operation` | Transactions financières |
| `participant` | Personnes impliquées dans un projet |
| `category` | Catégories de dépenses (prédéfinies) |
| `budget` | Limites budgétaires par projet |
| `alert` | Notifications de dépassement de budget |
| `app_user_alert` | Liaison utilisateurs ↔ alertes |
| `project_participant` | Liaison projets ↔ participants |
| `operation_participant` | Répartition des dépenses par participant |

> 📄 Dictionnaire de données complet : [`docs/dictionnaire-de-donnees.md`](docs/s0.conception/conception/dictionnaire.donnes.md)
> 📄 Schéma MCD / MLD / MPD : [`docs/merise/`](docs/s0.conception/conception/MERISE.MCD.MLD.MPD)
> 📄 Schéma Prisma : [`prisma/schema.prisma`](prisma/schema.prisma)

---

## Routes API

Toutes les routes (hors auth) sont protégées par un token JWT :

```
Authorization: Bearer <token>
```

### Résumé des endpoints

| Domaine | Méthodes | Base URL |
|---|---|---|
| Auth | POST, GET | `/api/auth` |
| Utilisateurs | POST, PATCH, DELETE | `/api/users` |
| Projets | GET, POST, PATCH, DELETE | `/api/projects` |
| Participants | GET, POST, PATCH, DELETE | `/api/projects/:id/participants` |
| Opérations | GET, POST, PATCH, DELETE | `/api/projects/:id/operations` |
| Budgets | GET, POST, PATCH, DELETE | `/api/projects/:id/budgets` |
| Catégories | GET | `/api/categories` |
| Alertes | GET, PATCH | `/api/alertes` |
| Remboursements | GET | `/api/projects/:id/reimbursements` |

> 📄 Liste complète et détaillée des routes : [`docs/routes-api.md`](docs/s0.conception/cahier.des.charges/liste.routes.api.md)
> 📄 Documentation interactive Swagger disponible sur : `http://localhost:3000/api-docs` *(à venir)*

---

## Tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration
```

Les tests utilisent **Vitest 4**.

Les tests unitaires couvrent notamment :
- La logique de calcul des balances
- L'algorithme glouton de remboursement
- La validation des règles métier (répartition des montants...)

---

## Qualité de code

Le projet utilise **Biome** comme linter et formatter unifié, configuré via `biome.json`.

**Exécution automatique à la sauvegarde** — installer l'extension VSCode `biomejs.biome` et ajouter dans `.vscode/settings.json` :

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome"
}
```

**Exécution automatique au commit** via Husky — le hook `pre-commit` lance `biome check` avant chaque commit. Si des erreurs non corrigeables sont détectées, le commit est bloqué.

---

## Documentation

| Document | Description | Lien |
|---|---|---|
| Architecture & choix techniques | Justification des technologies et de l'architecture | `docs/architecture.md` |
| Spécifications techniques | Stack complète avec versions et justifications | `docs/specifications-techniques.md` |
| Routes API | Liste complète des endpoints | `docs/routes-api.md` |
| Dictionnaire de données | Description de chaque champ de chaque table | `docs/dictionnaire-de-donnees.md` |
| Merise (MCD / MLD / MPD) | Modélisation de la base de données | `docs/merise/` |
| Algorithme de répartition | Logique de calcul des balances et remboursements | `docs/algorithme-repartition.md` |
| Charte graphique & maquettes | Éléments visuels du projet | `docs/design/` |
| Swagger UI | Documentation interactive de l'API | `http://localhost:3000/api-docs` |

---

## RGPD
Le projet applique des principes de base de conformité RGPD et de sécurité des données :

- minimisation des données collectées,
- authentification JWT,
- mots de passe hachés avec Argon2,
- validation et sanitation des données,
- protection contre les abus API (rate limiting),
- gestion sécurisée des variables d’environnement,
- contrôle des accès aux ressources utilisateur.

> Voir le dossier `docs/rgpd/` pour plus de détails :

- [politique-confidentialite.md](docs/s1.mise.en.place/rgpd/politique.confidentialite.md)
- [gestion-des-donnees.md](docs/s1.mise.en.place/rgpd/gestion.des.donnes.md)
- [securite.md](docs/s1.mise.en.place/rgpd/securite.md)
- [duree-conservation.md](docs/s1.mise.en.place/rgpd/duree.conservation.md)

---

# La Pince — Back-end *(English version)*

> REST API for an expense management application (projects, budgets, participants, reimbursements).  
> Built with Node.js, Express 5, Prisma, and PostgreSQL.

---

## Overview

This backend provides the core logic for:

- Managing projects and expenses
- Splitting costs between participants
- Budget tracking and alerts
- Automatic reimbursement calculations

[Frontend repo](https://github.com/O-clock-Helsinki/projet-cda-LaPince-frontend)

---

## Architecture

3-layer architecture:

Client → API → Database


Backend structure:

```

src/
├── routes
├── controllers
├── services
├── middlewares
├── schemas
└── lib

```

---

## Tech stack

- Node.js 24 LTS
- Express 5
- TypeScript 5
- PostgreSQL 18
- Prisma ORM 7
- Docker

### Security

- JWT authentication
- Argon2 password hashing
- Zod validation
- Helmet, CORS
- rate limiting + XSS protection

---

## Setup

```bash
git clone https://github.com/O-clock-Helsinki/projet-cda-LaPince-backend.git
cd projet-cda-LaPince-backend
npm install
cp .env.example .env
cp .dockerignore.example .dockerignore
npm run docker:up
npm run db:migrate
npm run db:seed
```

API:

```
http://localhost:3000
```

Adminer:

```
http://localhost:8080
```

---

## Scripts

* `npm run dev` → start server
* `npm run docker:up/down` → manage containers
* `npm run db:migrate/seed` → database setup
* `npm run test:unit/integration` → tests
* `npm run lint / format / check` → code quality

---

## API

Main routes:

* `/api/auth`
* `/api/users`
* `/api/projects`
* `/api/operations`
* `/api/participants`
* `/api/budgets`
* `/api/categories`
* `/api/alertes`

JWT required:

```
Authorization: Bearer <token>
```

Swagger: `/api-docs`

---

## Database

Main entities:

* Users
* Projects
* Operations (expenses)
* Participants
* Categories
* Budgets
* Alerts

Relations:

* projects ↔ participants
* operations ↔ participants
* users ↔ alerts

---

## Tests

* Unit tests: business logic
* Integration tests: API flows

---

## Docs

See `/docs` for:

* Architecture
* API routes
* Database schema
* Reimbursement logic


---

*La Pince — Projet CDA — O'clock Helsinki — 2026*