# 📦 Retour d'expérience — Déploiement Frontend La Pince

## Stack déployée

```
Frontend (React + Vite)  →  Vercel
Backend (Express)        →  Render (déjà déployé)
Base de données          →  Render (PostgreSQL)
```

---

## Étape 1 — Préparation du code

### 1.1 Corriger le script `prepare` dans `package.json`

Husky n'est pas disponible en prod, il faut éviter que le build plante :

```json
"prepare": "husky || true"
```

### 1.2 Créer `src/lib/api.ts`

Centraliser l'URL du backend pour pouvoir la configurer via variable d'environnement :

```typescript
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

### 1.3 Créer `.env.example` à la racine

```dotenv
# Backend API URL
VITE_API_URL=http://localhost:3000
```

### 1.4 Créer `.env` à la racine (ne pas commiter)

```dotenv
VITE_API_URL=http://localhost:3000
```

> ⚠️ Vérifier que `.env` est bien dans le `.gitignore`.

### 1.5 Vérifier que le build passe en local

```bash
npm run build
```

---

## Étape 2 — Préparer le repo GitHub

### Problème rencontré
Le repo appartient à l'organisation O-clock — Vercel ne peut pas y accéder, et le fork est désactivé.

### Solution
Créer un repo personnel vide sur GitHub (sans README, sans .gitignore), puis pousser le code :

```bash
git remote add personal https://TOKEN@github.com/username/lapince-frontend-test.git
git push personal feat/deploy-test
```

> ⚠️ Réutiliser le même token GitHub que pour le backend (permissions `repo` + `workflow`).

---

## Étape 3 — Déployer sur Vercel

1. Se connecter sur [vercel.com](https://vercel.com) avec GitHub
2. **Add New Project → Import Git Repository**
3. Sélectionner `lapince-frontend-test`
4. Vercel détecte automatiquement **Vite** comme framework
5. Remplir la configuration :

| Paramètre | Valeur |
|---|---|
| Project Name | `lapince-frontend` |
| Framework | `Vite` (détecté automatiquement) |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

6. Ajouter la variable d'environnement :

| Variable | Valeur | Environnements |
|---|---|---|
| `VITE_API_URL` | `https://lapince-backend.onrender.com` | All Environments |

> ⚠️ Les variables `VITE_` sont exposées côté client. Ne jamais y mettre de secrets.

7. Cliquer **Deploy**

---

## ⚠️ Warning rencontré (sans impact)

```
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
```

C'est une dépendance indirecte de `vitest` qui utilise une ancienne API Node.js. Sans impact sur le build, peut être ignoré.

---

## Résultat final

```
✅ Build successful
✅ Service live → https://lapince-frontend.vercel.app
```

---

## 🔄 Workflow de mise à jour

```
Push sur la branche configurée
  → Vercel détecte le changement automatiquement
  → npm install
  → npm run build (tsc -b && vite build)
  → Déploiement automatique
```

---

## ⚠️ Attention au CORS

Le backend doit autoriser l'URL Vercel dans sa config CORS :

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://lapince-frontend.vercel.app'
  ],
  credentials: true
}))
```

Sans ça : cookies cassés, requêtes bloquées, auth KO.
