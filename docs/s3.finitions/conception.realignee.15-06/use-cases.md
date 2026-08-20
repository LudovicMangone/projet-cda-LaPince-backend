# Use Cases — La Pince

> Version mise à jour post-développement (15/06/2026).

## Acteurs

| Acteur | Description |
|---|---|
| **Utilisateur** | Toute personne ayant un compte sur La Pince. C'est l'unique acteur du système — il crée et gère ses projets, saisit les dépenses et consulte les remboursements. |

---

## UC-01 — S'inscrire

**Acteur** : Utilisateur (non connecté)

### Scénario nominal

1. L'utilisateur accède à la page d'inscription.
2. Il renseigne son nom, son email et un mot de passe.
3. Il soumet le formulaire.
4. Le système valide les données, crée le compte et génère automatiquement un projet de démonstration complet (participants, budget, opérations exemples, alerte).
5. L'utilisateur est redirigé vers le dashboard avec le projet de démo déjà visible.

### Scénarios alternatifs

- **Email déjà utilisé** : le système affiche un message d'erreur et invite l'utilisateur à se connecter.
- **Mot de passe trop faible** : le système affiche les critères de sécurité non respectés (min. 8 caractères, majuscule, minuscule, chiffre).
- **Champ manquant** : le système bloque l'envoi et indique les champs obligatoires.

---

## UC-02 — Se connecter

**Acteur** : Utilisateur (non connecté)

### Scénario nominal

1. L'utilisateur accède à la page de connexion.
2. Il saisit son email et son mot de passe.
3. Il soumet le formulaire.
4. Le système vérifie les identifiants et ouvre la session (token JWT valable 7 jours).
5. L'utilisateur est redirigé vers son dashboard.

### Scénarios alternatifs

- **Identifiants incorrects** : le système affiche un message d'erreur générique (sans préciser si c'est l'email ou le mot de passe).
- **Compte inexistant** : même message d'erreur générique pour des raisons de sécurité.


---

## UC-03 — Se déconnecter

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur le bouton "Se déconnecter".
2. Le système supprime le token JWT côté client (localStorage).
3. L'utilisateur est redirigé vers la page de connexion.

### Scénarios alternatifs

- **Token JWT expiré** (7 jours) : lors d'une requête protégée, le système retourne une erreur 401 et le front redirige vers la page de connexion.


---

## UC-04 — Voir ses projets (Dashboard)

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur arrive sur le dashboard après connexion.
2. Le système affiche les indicateurs clés : projets actifs, montant dû, montant que les autres lui doivent, solde net global.
3. Le système affiche le tableau de projets avec nom, type, participants, budget et solde personnel par projet.
4. L'utilisateur peut cliquer sur une ligne pour accéder au détail d'un projet.

### Scénarios alternatifs

- **Aucun projet** : le système affiche un écran vide avec un bouton "Créer mon premier projet".
- **Pagination** : les projets sont chargés par page de 5 (pagination cursor), l'utilisateur peut charger la suite.

---

## UC-05 — Créer un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur "Nouveau projet" depuis le dashboard.
2. Il renseigne le nom du projet et choisit un type (Voyage, Maison/Coloc, Anniversaire, Repas/Sortie, Pro/Travail, Autre).
3. Il peut optionnellement ajouter un budget global (montant + seuil d'alerte en %) et des participants.
4. Il valide la création.
5. Le système crée le projet, le budget et les participants dans une seule transaction et redirige vers la page de détail.

### Scénarios alternatifs

- **Nom manquant** : le système bloque la validation.
- **Annulation** : l'utilisateur annule et revient au dashboard sans création.

---

## UC-06 — Gérer le budget d'un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail du projet (onglet Détails), l'utilisateur accède à la gestion du budget.
2. Il définit un montant plafond global et un seuil d'alerte (en %, défaut 80 %).
3. Il valide. Le système enregistre le budget et l'affiche avec sa barre de progression et la ventilation par catégorie.

### Scénarios alternatifs

- **Montant invalide** : le système refuse une valeur nulle ou négative.
- **Modification** : l'utilisateur peut modifier le montant ou le seuil depuis la même interface.
- **Suppression** : l'utilisateur peut supprimer le budget 

---

## UC-07 — Gérer les participants

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail du projet (onglet Détails), l'utilisateur accède à la liste des participants.
2. Il ajoute, modifie ou supprime des participants.
3. Il valide. Le système envoie la liste complète mise à jour en une seule requête (remplacement en masse).

### Scénarios alternatifs

- **Nom manquant** : le système bloque l'ajout.
- **Participant lié à des opérations** : la suppression n'est pas permise si un participant est lié a des opérations.

---

## UC-08 — Voir le détail d'un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur un projet depuis le dashboard.
2. Le système affiche la page de détail organisée en onglets :
   - **Vue d'ensemble** : budget global + barre de progression, ventilation des dépenses par catégorie, soldes des participants, remboursements optimisés.
   - **Opérations** : liste complète des dépenses avec filtres.
   - **Alertes** : historique des alertes du projet.
   - **Détails** : modification du projet (nom, type, description, budget, participants, archivage, suppression).

### Scénarios alternatifs

- **Projet sans dépenses** : les sections dépenses et soldes affichent un état vide.

---

## UC-09 — Saisir une dépense

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail d'un projet, l'utilisateur clique sur "Ajouter une dépense".
2. Il renseigne : nom, montant, date, catégorie et participant payeur.
3. Il sélectionne quels participants sont concernés.
4. Le front calcule automatiquement les parts égales.
5. Il valide. Le back enregistre l'opération et vérifie si le seuil du budget est dépassé (alerte automatique si oui).

### Scénarios alternatifs

- **Montant manquant ou invalide** : le système bloque la validation.
- **Aucun participant sélectionné** : le système bloque la validation.
- **Seuil de budget dépassé** : le back crée une alerte automatiquement après l'enregistrement.

---

## UC-10 — Répartir une dépense par participant

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Lors de la saisie d'une dépense, les participants sélectionnés reçoivent automatiquement une part égale.
2. L'utilisateur peut modifier manuellement le montant attribué à chaque participant.
3. Le système vérifie que la somme des parts correspond au total.
4. L'utilisateur valide.

### Scénarios alternatifs

- **Somme incorrecte** : le système affiche l'écart et bloque la validation.
- **Réinitialisation** : à chaques cliques sur un participant cela recalcul la répartitions.

---

## UC-11 — Modifier ou supprimer une dépense

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la liste des dépenses, l'utilisateur clique sur une ligne pour ouvrir la modale de modification (pré-remplie depuis le state).
2. Il modifie les champs souhaités et valide.
3. Le système met à jour l'opération et recalcule les balances et aussi les alertes si nécessaire.

### Scénarios alternatifs

- **Suppression** : l'utilisateur clique sur "Supprimer" ; le système supprime la dépense et vérifie si une alerte active doit être résolue (si le total redescend sous le seuil).

---

## UC-12 — Voir les soldes et remboursements

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la vue d'ensemble du projet, l'utilisateur consulte la section balances.
2. Le système affiche la liste optimisée des remboursements (algorithme glouton : minimum de transactions pour solder le projet).

### Scénarios alternatifs

- **Comptes équilibrés** : le système affiche un message indiquant qu'aucun remboursement n'est nécessaire.
- **Aucune dépense** : la section affiche un état vide.

---

## UC-13 — Consulter et gérer les alertes

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Sur le dashboard, une pastille indique le nombre d'alertes non lues par projet.
2. L'utilisateur accède à la page de détail du projet.
3. Une notification signale les dépassements de seuil budgétaire.
4. L'utilisateur marque une alerte comme lue.
5. Il peut accéder à l'onglet **Alertes** pour consulter l'historique complet (lues, non lues, résolues).

### Scénarios alternatifs

- **Aucune alerte** : la pastille est absente et l'onglet Alertes indique qu'aucune alerte n'a été déclenchée.
- **Alerte résolue automatiquement** : si le total repasse sous le seuil (suite à suppression/modification d'opération) ou une augmentation du budget, le back passe l'alerte en `resolved` — visible dans l'historique.

---

## UC-14 — Archiver un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis l'onglet Détails du projet, l'utilisateur clique sur "Archiver le projet".
2. Le système passe `isArchived` à `true` via `PATCH /api/projects/:id`.
3. Le projet est masqué de la liste principale du dashboard.

### Scénarios alternatifs

- **Désarchivage** : depuis l'onglet Détails, l'utilisateur peut restaurer le projet.
