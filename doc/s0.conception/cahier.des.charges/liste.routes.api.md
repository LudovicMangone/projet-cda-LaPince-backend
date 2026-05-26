# #14 — Liste des routes API

## Description
Lister tous les endpoints API REST nécessaires au fonctionnement de LaPince.
Toutes les routes (hors Auth) sont protégées par un token JWT passé dans le header :
`Authorization: Bearer <token>`

---

## Routes Auth

| Méthode | Route              | Description                         |
|---------|--------------------|-------------------------------------|
| POST    | /api/auth/register | Inscription d'un nouvel utilisateur |
| POST    | /api/auth/login    | Connexion et retour du token JWT    |
| POST    | /api/auth/logout   | Déconnexion                         |
| GET     | /api/auth/me       | Récupérer l'utilisateur connecté    |

> `GET /api/auth/me` est nécessaire pour hydrater l'interface au chargement et vérifier la validité du token.

---

## Routes Utilisateurs

| Méthode | Route          | Description            |
|---------|----------------|------------------------|
| POST    | /api/users     | Créer un utilisateur   |
| PATCH   | /api/users/:id | Modifier le profil     |
| DELETE  | /api/users/:id | Supprimer le compte    |

> Pas de `GET /api/users/:id` — `GET /api/auth/me` couvre déjà ce besoin dans le MVP.

---

## Routes Projets

| Méthode | Route                        | Description                                                     |
|---------|------------------------------|-----------------------------------------------------------------|
| GET     | /api/projects                | Lister les projets de l'utilisateur + KPIs globaux             |
| POST    | /api/projects                | Créer un nouveau projet                                         |
| GET     | /api/projects/:id            | Récupérer le détail d'un projet (+ balance + résumé budgétaire) |
| PATCH   | /api/projects/:id            | Modifier un projet                                              |
| PATCH   | /api/projects/:id/archive    | Archiver / désarchiver un projet                                |
| DELETE  | /api/projects/:id            | Supprimer un projet                                             |

> **KPIs** (Tu dois, On te doit, Solde net, Projets actifs) inclus dans `GET /api/projects` pour le MVP.
> Une route dédiée `GET /api/dashboard` pourrait être envisagée dans une version ultérieure si les besoins en performance l'exigent.
>
> **Budget global** géré directement dans `POST` et `PATCH /api/projects/:id` — c'est un détail du projet.
> Les budgets par catégorie ont leurs propres routes.

---

## Routes Participants

| Méthode | Route                                    | Description                    |
|---------|------------------------------------------|--------------------------------|
| GET     | /api/projects/:id/participants           | Lister les participants        |
| POST    | /api/projects/:id/participants           | Ajouter un participant         |
| PATCH   | /api/projects/:id/participants/:partId   | Modifier un participant        |
| DELETE  | /api/projects/:id/participants/:partId   | Retirer un participant         |

> Un participant appartient à un projet, pas à un utilisateur.

---

## Routes Opérations

| Méthode | Route                                      | Description              |
|---------|--------------------------------------------|--------------------------|
| GET     | /api/projects/:id/operations               | Lister les opérations    |
| POST    | /api/projects/:id/operations               | Créer une opération      |
| PATCH   | /api/projects/:id/operations/:opId         | Modifier une opération   |
| DELETE  | /api/projects/:id/operations/:opId         | Supprimer une opération  |

> Pas de `GET /api/projects/:id/operations/:opId` — au clic sur une ligne, les données sont déjà
> chargées côté front via la liste. La modale d'édition est pré-remplie directement depuis le state.
>
> Le body d'une opération inclut la répartition entre participants (table de liaison `LIE` du MCD) :
> ```json
> {
>   "type": "debit",
>   "nom": "Dîner Time Out Market",
>   "montant": 128.40,
>   "date": "2026-05-17",
>   "categorie_id": 3,
>   "paye_par": 2,
>   "repartition": [
>     { "participant_id": 1, "montant ou pourcentage": "à définir" },
>     { "participant_id": 2, "montant ou pourcentage": "à définir" },
>     { "participant_id": 3, "montant ou pourcentage": "à définir" }
>   ]
> }
> ```

---

## Routes Budgets par catégorie

| Méthode | Route                                        | Description                    |
|---------|----------------------------------------------|--------------------------------|
| GET     | /api/projects/:id/budgets                    | Lister les budgets par catégorie |
| POST    | /api/projects/:id/budgets                    | Créer un budget par catégorie  |
| PATCH   | /api/projects/:id/budgets/:budgetId          | Modifier un budget             |
| DELETE  | /api/projects/:id/budgets/:budgetId          | Supprimer un budget            |

---

## Routes Catégories

| Méthode | Route           | Description                      |
|---------|-----------------|----------------------------------|
| GET     | /api/categories | Lister les catégories disponibles |

> Catégories prédéfinies, gérées uniquement par le dev côté back.
> Pas de `POST`, `PATCH` ou `DELETE` exposés dans le MVP.

---

## Routes Alertes

| Méthode | Route                      | Description                    |
|---------|----------------------------|--------------------------------|
| GET     | /api/alertes               | Lister les alertes de l'utilisateur connecté |
| PATCH   | /api/alertes/:alerteId     | Marquer une alerte comme lue   |

 > Les alertes sont persistées en base, elles constituent un historique consultable.
 >
 > Pas de `POST` : les alertes sont générées automatiquement par le back quand un seuil est atteint.
 >
 > Pas de `DELETE` : Les alertes sont uniquement marquées lues ou non lues.
