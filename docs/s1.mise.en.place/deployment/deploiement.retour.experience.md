# Retour d'expérience — Déploiement La Pince

## Stack déployée

```
Frontend (React)   →   Vercel (à venir)
Backend (Express)  →   Render
Base de données    →   Render (PostgreSQL)
```

---

## Étape 1 — Préparation du code

Avant de toucher Render, plusieurs modifications sont nécessaires dans le code.

### 1.1 Ajouter les scripts manquants dans `package.json`

```json
"prepare": "husky || true",
"start": "tsx src/app.ts",
"db:generate": "prisma generate"
```

> ⚠️ `husky || true` est indispensable — sans ça, `npm install` plante en prod car husky n'est pas disponible hors dev.
> ⚠️ `start` avec `tsx src/app.ts` est plus simple que `tsc` + `node dist/app.js` qui pose des problèmes d'extensions de fichiers en ESM.

### 1.2 Nettoyer `tsconfig.json`

Retirer la ligne `"ignoreDeprecations": "6.0"` qui cause une erreur à la compilation :
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### 1.3 Créer `src/lib/prisma.ts`

Le client Prisma doit être initialisé avec l'adapter `pg` en Prisma 7 :

```typescript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

> ⚠️ Ne pas oublier `import "dotenv/config"` sinon `DATABASE_URL` sera `undefined` au démarrage.

### 1.4 Port dynamique dans `src/config/env.config.ts`

Render injecte son propre `PORT`, il ne faut pas le forcer :

```typescript
import "dotenv/config";

port: parseInt(process.env.PORT || "3000", 10),
```

### 1.5 Vérifier le `.gitignore`

S'assurer que `/generated/prisma` est bien ignoré — Render le génère lui-même au build :
```
/generated/prisma
```

---

## Étape 2 — Créer la base de données sur Render

1. Se connecter sur [render.com](https://render.com) avec GitHub
2. **New + → PostgreSQL**
3. Remplir :

| Paramètre | Valeur |
|---|---|
| Name | `lapince-db` |
| Database | `lapince_db` |
| User | `lapince_user` |
| Region | `Frankfurt (EU Central)` |
| PostgreSQL Version | `18` |
| Plan | `Free` |

4. Cliquer **Create Database**
5. Copier l'**Internal Database URL** — elle sera utilisée comme `DATABASE_URL` du backend

---

## Étape 3 — Préparer le repo GitHub

### Problème rencontré
Le repo appartient à l'organisation O-clock — Render ne peut pas y accéder, et le fork est désactivé.

### Solution
Créer un repo personnel vide sur GitHub (sans README, sans .gitignore), puis pousser le code dessus :

```bash
git remote add personal https://TOKEN@github.com/username/lapince-backend-test.git
git push personal feat/deploy-test
```

> ⚠️ Le token GitHub doit avoir les permissions `repo` + `workflow`.
> Générer un token sur : https://github.com/settings/tokens/new

---

## Étape 4 — Créer le Web Service sur Render

1. **New + → Web Service**
2. Connecter le repo personnel `lapince-backend-test`
3. Remplir :

| Paramètre | Valeur |
|---|---|
| Name | `lapince-backend` |
| Region | `Frankfurt (EU Central)` |
| Branch | `feat/deploy-test` (ou `main` en prod) |
| Runtime | `Node` |
| Build Command | `npm install && npm run db:generate` |
| Start Command | `npm run start` |
| Pre-Deploy Command | `npx prisma migrate deploy` |
| Plan | `Free` |

4. Ajouter les **Variables d'environnement** :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | Internal Database URL copiée à l'étape 2 |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Généré avec la commande ci-dessous |

Générer le `JWT_SECRET` :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> ⚠️ Ne pas ajouter `PORT` — Render l'injecte automatiquement.

5. Cliquer **Create Web Service**

---

## Étape 5 — Problèmes rencontrés pendant le déploiement

### 5.1 Render utilisait Yarn au lieu de npm
**Erreur** : `error Command "start" not found` via yarn
**Solution** : Forcer `npm run start` dans la Start Command des settings.

### 5.2 Husky introuvable
**Erreur** :
```
sh: 1: husky: not found
npm error code 127
```
**Solution** : `"prepare": "husky || true"` dans `package.json`

### 5.3 `DATABASE_URL` manquante
**Erreur** : `Error: Missing required environment variable : DATABASE_URL`
**Solution** : Ajouter `import "dotenv/config"` dans `env.config.ts`

---

## Résultat final

```
✅ Build successful
✅ Prisma client généré
✅ Server is running
✅ Service live → https://lapince-backend.onrender.com
```

---

## ⚠️ Limitations du free tier Render

- Le serveur se met en **veille après 15 min** d'inactivité
- Le **cold start** prend 30-60 secondes au premier appel
- Suffisant pour les démos et tests, pas pour la production réelle

---

## 🔄 Workflow de mise à jour

```
Push sur la branche configurée
  → Render détecte le changement automatiquement
  → npm install && npm run db:generate  (build)
  → npx prisma migrate deploy           (pre-deploy)
  → npm run start                       (démarrage)
```
