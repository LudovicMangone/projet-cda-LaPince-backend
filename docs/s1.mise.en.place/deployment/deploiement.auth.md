# 📦 Retour d'expérience — Déploiement complet La Pince (v2)

## Stack déployée

```
Frontend (React + Vite)  →  Vercel
Backend (Express)        →  Render
Base de données          →  Render (PostgreSQL)
```

---

## Résultat final

```
✅ Frontend  → https://lapince-frontend.vercel.app
✅ Backend   → https://lapince-backend.onrender.com
✅ Inscription / Connexion fonctionnelles
```

---

## Étape 1 — Préparation du code backend

### 1.1 Corriger `prepare` dans `package.json`
```json
"prepare": "husky || true"
```

### 1.2 Ajouter le script `start`
```json
"start": "tsx src/app.ts"
```

### 1.3 Ajouter `trust proxy` dans `src/app.ts`
Render utilise un reverse proxy — sans cette ligne, `express-rate-limit` plante :
```typescript
export const app = express();
app.set("trust proxy", 1); // Required for Render/reverse proxy
```

### 1.4 Corriger le CORS dans `src/config/cors.config.ts`
Remplacer le domaine placeholder par l'URL Vercel réelle :
```typescript
export const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://lapince-frontend.vercel.app"]
    : ["http://localhost:5173"];
```

### 1.5 Créer `src/lib/prisma.ts` avec l'adapter
```typescript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

### 1.6 Nettoyer `tsconfig.json`
Retirer `"ignoreDeprecations": "6.0"` qui cause une erreur à la compilation.

### 1.7 Vérifier `.gitignore`
S'assurer que `/generated/prisma` est bien ignoré.

---

## Étape 2 — Préparation du code frontend

### 2.1 Corriger `prepare` dans `package.json`
```json
"prepare": "husky || true"
```

### 2.2 Créer `src/lib/api.ts`
```typescript
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

### 2.3 Créer `.env.example`
```dotenv
VITE_API_URL=http://localhost:3000
```

### 2.4 Ajouter `vercel.json` à la racine
Sans ce fichier, React Router retourne 404 sur toutes les routes autres que `/` :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Étape 3 — Problème repo organisation O-clock

**Problème** : Render et Vercel ne peuvent pas accéder au repo de l'organisation O-clock. Le fork est désactivé.

**Solution** : Créer des repos personnels vides sur GitHub et y pousser le code :
```bash
git remote add personal https://TOKEN@github.com/username/lapince-backend-test.git
git push personal feat/deploy-test
```

> ⚠️ Le token GitHub doit avoir les permissions `repo` + `workflow`.
> Générer un token sur : https://github.com/settings/tokens/new

---

## Étape 4 — Configuration Render (Backend + BDD)

### Base de données PostgreSQL
| Paramètre | Valeur |
|---|---|
| Name | `lapince-db` |
| Database | `lapince_db` |
| User | `lapince_user` |
| Region | `Frankfurt (EU Central)` |
| PostgreSQL Version | `18` |
| Plan | `Free` |

Copier l'**Internal Database URL** pour la variable `DATABASE_URL`.

### Web Service Backend
| Paramètre | Valeur |
|---|---|
| Name | `lapince-backend` |
| Region | `Frankfurt (EU Central)` |
| Branch | `feat/deploy-test` |
| Runtime | `Node` |
| Build Command | `npm install && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `npm run start` |
| Plan | `Free` |

### Variables d'environnement Backend
| Variable | Valeur |
|---|---|
| `DATABASE_URL` | Internal Database URL de Render PostgreSQL |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

> ⚠️ Ne pas ajouter `PORT` — Render l'injecte automatiquement.

---

## Étape 5 — Configuration Vercel (Frontend)

| Paramètre | Valeur |
|---|---|
| Project Name | `lapince-frontend` |
| Framework | `Vite` (détecté automatiquement) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Variable d'environnement Frontend
| Variable | Valeur | Environnements |
|---|---|---|
| `VITE_API_URL` | `https://lapince-backend.onrender.com` | All Environments |

---

## Étape 6 — Problèmes rencontrés

### 6.1 Render utilise Yarn par défaut
**Erreur** : `error Command "start" not found`
**Solution** : Forcer `npm run start` dans la Start Command.

### 6.2 Husky introuvable en prod
**Erreur** : `sh: 1: husky: not found / npm error code 127`
**Solution** : `"prepare": "husky || true"`

### 6.3 Script `start` manquant
**Erreur** : `npm error Missing script: "start"`
**Solution** : Ajouter `"start": "tsx src/app.ts"` dans `package.json`

### 6.4 `db:generate` utilise `docker exec`
**Erreur** : `sh: 1: docker: not found`
**Solution** : Utiliser `npx prisma generate` directement dans la Build Command de Render.

### 6.5 `express-rate-limit` plante avec le proxy Render
**Erreur** : `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`
**Solution** : Ajouter `app.set("trust proxy", 1)` dans `app.ts`

### 6.6 CORS bloquait les requêtes
**Erreur** : `Access-Control-Allow-Origin header missing`
**Solution** : Mettre la vraie URL Vercel dans `cors.config.ts`

### 6.7 React Router retournait 404 sur les routes
**Erreur** : `GET /login HTTP 404`
**Solution** : Ajouter `vercel.json` avec les rewrites SPA

### 6.8 Migrations non jouées → erreur 500
**Erreur** : Inscription/connexion retournaient 500
**Cause** : Les tables n'existaient pas en DB
**Solution** : Ajouter `npx prisma migrate deploy` dans la Build Command de Render :
```
npm install && npx prisma generate && npx prisma migrate deploy
```

> ⚠️ La Pre-Deploy Command et le Shell ne sont pas disponibles sur le free tier Render.

### 6.9 Nano s'ouvre pendant le rebase
Lors d'un `git rebase`, l'éditeur nano s'ouvre pour confirmer les messages de commit :
- `Ctrl+X` pour quitter
- `Y` pour confirmer
- `Entrée` pour valider le nom du fichier

---

## ⚠️ Limitations du free tier Render

- Serveur en **veille après 15 min** d'inactivité → cold start de 30-60s
- **Pas de Shell** ni Pre-Deploy Command
- **Pas de Zero Downtime** → coupure au redéploiement
- Suffisant pour les démos et tests

---

## 🔄 Workflow de mise à jour

```
Push sur la branche configurée
  → Render/Vercel détecte le changement
  → npm install
  → npx prisma generate
  → npx prisma migrate deploy  (Render uniquement)
  → npm run start / npm run build
  → Déploiement automatique
```
