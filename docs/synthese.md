# Synthèse — LaPince

Application de partage de dépenses en groupe (React 19 / Express 5 / PostgreSQL 18 / Prisma 7).

## Ce qui a été livré
- Auth JWT, CRUD projets / participants / dépenses
- Algorithme glouton de remboursements optimisés
- Budget + alertes de seuil
- Déploiement Vercel (front) + Render (back)

## Les galères

**Docker/PostgreSQL** — Blocage sprint 1 J2, connexion instable entre containers.

**Typage front-back** — Désynchronisation répétée des types TypeScript entre les deux repos, source de bugs silencieux.

**Migrations Prisma non appliquées** — Table `category` absente en base, erreur 500 bloquante.

**Fuite mémoire backend** — Crash OOM à 2 Go de heap, serveur inaccessible.

## Ce qui reste
- Gestion d'erreurs centralisée côté front
- Navigation (`Link` vs boutons)
- Doublons d'appels API
