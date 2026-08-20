# User Stories — La Pince

> Version mise à jour post-développement (15/06/2026).

## Authentification

| En tant que | Je veux | Afin de |
|---|---|---|
| Nouvel utilisateur | Créer un compte | Accéder à l'application et découvrir un projet de démonstration pré-rempli |
| Utilisateur | Me connecter à mon compte | Accéder à mon dashboard |
| Utilisateur | Me déconnecter de mon compte | Sécuriser mon accès et protéger mes données |

---

## Dashboard

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Voir la liste de tous mes projets | Avoir une vue d'ensemble de mes projets |
| Utilisateur | Voir le budget global de chaque projet | Savoir où en est chaque projet financièrement |
| Utilisateur | Voir l'avancement des dépenses vs le budget de chaque projet | Identifier les projets qui approchent de leur limite |
| Utilisateur | Voir mon solde global et mon solde par projet | Avoir une vue d'ensemble de ce que je dois / ce qu'on me doit |
| Utilisateur | Accéder à un projet depuis le Dashboard | Consulter le détail d'un projet en un clic |
| Utilisateur | Voir les alertes budget non lues sur chaque projet | Savoir immédiatement si un seuil est dépassé |

---

## Page détail d'un projet

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Voir un récapitulatif du budget et son avancement | Suivre la consommation du projet |
| Utilisateur | Voir la ventilation des dépenses par catégorie | Identifier les postes de dépense les plus importants |
| Utilisateur | Voir la liste complète des dépenses du projet | Avoir l'historique de toutes les opérations |
| Utilisateur | Voir la liste des participants du projet | Savoir qui est impliqué dans le projet |
| Utilisateur | Voir le solde de chaque participant | Avoir une vue rapide de qui doit de l'argent à qui |
| Utilisateur | Consulter l'historique des alertes du projet | Avoir le suivi des dépassements de budget |

---

## Gestion des projets

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Créer un nouveau projet avec un nom et un type | Catégoriser et suivre les dépenses d'un groupe |
| Utilisateur | Choisir le type de projet (Voyage, Coloc, Anniversaire…) | Identifier rapidement mes projets dans le dashboard |
| Utilisateur | Définir un budget global optionnel avec un seuil d'alerte | Être averti si les dépenses dépassent mon objectif |
| Utilisateur | Modifier un projet (nom, description, type, budget) | Corriger une erreur ou adapter le projet |
| Utilisateur | Archiver un projet | Clôturer un projet terminé sans le supprimer |
| Utilisateur | Supprimer un projet | Effacer définitivement un projet inutile |

---

## Gestion des participants

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Ajouter des participants à un projet | Représenter les personnes impliquées sans qu'elles aient de compte |
| Utilisateur | Nommer chaque participant | Les identifier facilement lors de la saisie des dépenses |
| Utilisateur | Modifier ou supprimer des participants | Corriger une erreur de saisie ou adapter le groupe |

---

## Saisie des dépenses

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Enregistrer une dépense avec un nom, un montant, une date et une catégorie | Consigner ce qui a été dépensé dans le projet |
| Utilisateur | Indiquer quel participant a payé la dépense | Savoir qui a avancé l'argent |
| Utilisateur | Choisir quels participants sont concernés par une dépense | Inclure seulement ceux qui ont participé |
| Utilisateur | Laisser le front calculer automatiquement les parts égales | Aller vite sur les dépenses simples |
| Utilisateur | Définir un montant différent par participant | Répartir une dépense de façon inégale |
| Utilisateur | Consulter la liste des dépenses d'un projet | Avoir l'historique complet |
| Utilisateur | Modifier ou supprimer une dépense | Corriger une erreur de saisie |
---

## Calcul des remboursements

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Voir le solde de chaque participant (ce qu'il a payé vs ce qu'il doit) | Savoir qui est créditeur ou débiteur |
| Utilisateur | Voir la liste optimisée des remboursements | Solder les comptes avec le minimum de transactions (qui doit combien à qui) |

---

## Alertes budget

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Recevoir une alerte quand les dépenses dépassent le seuil de mon budget | Réagir avant de dépasser mon enveloppe |
| Utilisateur | Marquer une alerte comme lue | Nettoyer les notifications |
| Utilisateur | Voir l'historique de toutes les alertes d'un projet | Avoir la traçabilité des dépassements |
