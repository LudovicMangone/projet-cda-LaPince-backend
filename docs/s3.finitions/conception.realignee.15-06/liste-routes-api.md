# Liste des routes API — La Pince

> Version mise à jour post-développement (15/06/2026).
> Synchronisée avec les routers Express et les appels frontend réels.

Toutes les routes (hors Auth et Categories) sont protégées par un token JWT passé en header :
`Authorization: Bearer <token>`

---

## Routes Auth

| Méthode | Route | Description |
|---|---|---|
| POST | /api/auth/register | Inscription — crée le compte + un projet de démo complet |
| POST | /api/auth/login | Connexion — retourne le token JWT |
| POST | /api/auth/logout | Déconnexion (invalide la session côté client) |
| GET | /api/auth/me | Récupère l'utilisateur connecté (hydratation au chargement) |

> **À l'inscription**, le back crée automatiquement dans une transaction unique :
> un projet de démonstration, 3 participants fictifs (Alice, Bob, Charlie), un budget (300 €, seuil 80 %), 3 opérations exemples et une alerte déclenchée — pour permettre à l'utilisateur de découvrir l'interface immédiatement.

---

## Routes Projets

| Méthode | Route | Description |
|---|---|---|
| GET | /api/projects | Liste les projets de l'utilisateur + balance par projet + pagination cursor |
| POST | /api/projects | Crée un projet (avec budget et participants optionnels en une seule requête) |
| GET | /api/projects/:id | Récupère le détail d'un projet (participants, budget) |
| PATCH | /api/projects/:id | Modifie un projet (nom, description, type, isArchived, budget) |
| DELETE | /api/projects/:id | Supprime un projet |

> **Archivage** : via `PATCH /api/projects/:id` avec `{ "isArchived": true }`. Pas de route `/archive` dédiée.
>
> **Budget** : créé ou modifié via `POST` et `PATCH /api/projects/:id` dans le corps de la requête — pas de route budget indépendante pour la création/modification/suppression.


## Routes Participants

| Méthode | Route | Description |
|---|---|---|
| PATCH | /api/projects/:id/participants | Remplace la liste complète des participants du projet |

> **Pas de CRUD unitaire** : la gestion des participants se fait par **remplacement en masse** du tableau complet. Le back compare l'ancienne et la nouvelle liste pour créer les nouveaux participants et supprimer les anciens.


## Routes Opérations

| Méthode | Route | Description |
|---|---|---|
| GET | /api/projects/:id/operations | Liste toutes les opérations du projet |
| POST | /api/projects/:id/operations | Crée une opération |
| PATCH | /api/projects/:id/operations/:operationId | Modifie une opération |
| DELETE | /api/projects/:id/operations/:operationId | Supprime une opération |

> Pas de `GET .../operations/:id` — au clic sur une ligne, le front pré-remplit la modale depuis le state déjà chargé.
>
> Après chaque mutation (créer, modifier, supprimer), le back vérifie automatiquement le seuil d'alerte du budget et crée ou résout une alerte si nécessaire.

### Body — POST et PATCH /api/projects/:id/operations

```json
{
  "name": "Dîner Time Out Market",
  "amount": 128.40,
  "date": "2026-05-17",
  "isAmountCalculated": false,
  "categoryId": 22,
  "projectId": 7,
  "payerParticipantId": 2,
  "operationParticipants": [
    { "participantId": 1, "isRepartitionAmountCalculated": true,  "repartitionAmount": 42.80 },
    { "participantId": 2, "isRepartitionAmountCalculated": true,  "repartitionAmount": 42.80 },
    { "participantId": 3, "isRepartitionAmountCalculated": false, "repartitionAmount": 42.80 }
  ]
}
```

> `isAmountCalculated` : `true` = parts calculées automatiquement en parts égales par le front / `false` = montants saisis manuellement.
>
> `isRepartitionAmountCalculated` : même distinction au niveau de chaque participant.
>
> La répartition est **calculée côté front** et envoyée dans le body. Le back valide et enregistre.
>
> `repartitionAmount` est toujours un **montant en euros** (pas un pourcentage).

---

## Routes Budgets

| Méthode | Route | Description |
|---|---|---|
| GET | /api/projects/:id/budgets | Résumé budgétaire du projet |

> **Lecture seule.** Retourne le total dépensé, le plafond global, le seuil d'alerte et la ventilation des dépenses par catégorie.
>
> La **création, modification et suppression** du budget passent par `POST` / `PATCH /api/projects/:id`.
>

### Réponse — GET /api/projects/:id/budgets

```json
{
  "totalSpent": 243.40,
  "totalLimit": 800,
  "alertThreshold": 80,
  "spentByCategory": [
    { "categoryId": 22, "categoryName": "Restauration", "color": "#32CD32", "spent": 128.40 },
    { "categoryId": 11, "categoryName": "Transport",    "color": "#FF8C00", "spent": 115.00 }
  ]
}
```

---

## Routes Balance

| Méthode | Route | Description |
|---|---|---|
| GET | /api/balance | Solde global de l'utilisateur (tous projets confondus) |
| GET | /api/projects/:id/balance | Soldes + remboursements optimisés d'un projet |

> `GET /api/projects/:id/balance` applique l'algorithme glouton et retourne la liste minimale de transactions pour solder le projet (qui doit combien à qui).

### Réponse — GET /api/projects/:id/balance

```json
[
  { "from": "Bob",     "to": "Alice",   "amount": 42.80 },
  { "from": "Charlie", "to": "Alice",   "amount": 21.40 }
]
```

---

## Routes Catégories

| Méthode | Route | Description |
|---|---|---|
| GET | /api/categories | Liste toutes les catégories disponibles |

> Catégories prédéfinies, gérées uniquement côté back. Pas de `POST`, `PATCH` ou `DELETE` dans le MVP.

---

## Routes Alertes

| Méthode | Route | Description |
|---|---|---|
| GET | /api/alertes | Liste toutes les alertes de l'utilisateur connecté |
| GET | /api/projects/:id/alertes | Liste les alertes d'un projet spécifique |
| PATCH | /api/alertes/:alerteId | Met à jour le statut d'une alerte |

> Les alertes sont **créées automatiquement** par le back lors d'une mutation d'opération (pas de `POST` exposé).
>
> Pas de `DELETE` : les alertes sont uniquement marquées `read`, `unread` ou `resolved`.
>
> Le statut `resolved` est passé automatiquement par le back quand le total redescend sous le seuil (ex. après suppression d'une opération).

### Body — PATCH /api/alertes/:alerteId

```json
{ "status": "read" }
```

> Valeurs acceptées : `"unread"` | `"read"` | `"resolved"`

---
