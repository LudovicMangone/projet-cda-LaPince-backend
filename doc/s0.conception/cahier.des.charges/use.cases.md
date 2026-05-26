# Use Cases — La Pince

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

4. Le système valide les données et crée le compte.

5. L'utilisateur est redirigé vers le dashboard.

### Scénarios alternatifs

- **Email déjà utilisé** : le système affiche un message d'erreur et invite l'utilisateur à se connecter.

- **Mot de passe trop faible** : le système affiche les critères de sécurité non respectés.

- **Champ manquant** : le système bloque l'envoi et indique les champs obligatoires.

---

## UC-02 — Se connecter

**Acteur** : Utilisateur (non connecté)

### Scénario nominal

1. L'utilisateur accède à la page de connexion.

2. Il saisit son email et son mot de passe.

3. Il soumet le formulaire.

4. Le système vérifie les identifiants et ouvre la session.

5. L'utilisateur est redirigé vers son dashboard.

### Scénarios alternatifs

- **Identifiants incorrects** : le système affiche un message d'erreur générique (sans préciser si c'est l'email ou le mot de passe).

- **Compte inexistant** : même message d'erreur générique pour des raisons de sécurité.

- **Mot de passe oublié** : l'utilisateur clique sur "Mot de passe oublié" et reçoit un email de réinitialisation.

---

## UC-03 — Se déconnecter

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur le bouton "Se déconnecter".

2. Le système ferme la session et supprime le token d'authentification.

3. L'utilisateur est redirigé vers la page de connexion.

### Scénarios alternatifs

- **Déconnexion automatique** : après une période d'inactivité, le système expire la session et redirige l'utilisateur vers la page de connexion avec un message explicatif.

---

## UC-04 — Voir ses projets (Dashboard)

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur arrive sur le dashboard après connexion.

2. Le système affiche les 4 indicateurs clés : projets actifs, montant dû, montant dû par les autres, solde net.

3. Le système affiche le tableau listant tous ses projets avec nom, participants, budget et solde actuel.

4. L'utilisateur peut cliquer sur une ligne pour accéder au détail d'un projet.

### Scénarios alternatifs

- **Aucun projet** : le système affiche un écran vide avec un bouton "Créer mon premier projet".

---

## UC-05 — Créer un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur "Nouveau projet" depuis le dashboard.

2. Il saisit le nom du projet, peut ou non ajouter des budgets et des participants.

3. Il valide la création.

4. Le système crée le projet et redirige vers sa page de détail.

5. L'utilisateur peut par la suite ajouter des budgets et des participants.

### Scénarios alternatifs

- **Nom manquant** : le système bloque la validation et indique que le nom est obligatoire.

- **Annulation** : l'utilisateur annule et revient au dashboard sans création.

---

## UC-06 — Gérer les budgets

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail du projet, l'utilisateur accède à la gestion des budgets.

2. Il crée un budget en renseignant : type global et/ou catégorie, montant plafond et seuil d'alerte en %.(par défaut 80%)

3. Il valide. Le système enregistre le budget et l'affiche avec sa barre de progression.

4. L'utilisateur peut ajouter plusieurs budgets sur un même projet.

### Scénarios alternatifs

- **Montant invalide** : le système refuse une valeur nulle ou négative.

- **Modification** : l'utilisateur peut modifier le montant ou le seuil d'un budget existant.

- **Suppression** : l'utilisateur supprime un budget ; le système demande confirmation.

---

## UC-07 — Gérer les participants

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail du projet, l'utilisateur accède à la gestion des participants.

2. Il ajoute un participant fictif en renseignant son prénom.

3. Le système enregistre le participant et l'affiche dans la liste du projet.

4. L'utilisateur peut ajouter autant de participants que nécessaire.

### Scénarios alternatifs

- **Nom manquant** : le système bloque l'ajout et indique que le prénom est obligatoire.

- **Suppression** : l'utilisateur supprime un participant ; si des dépenses lui sont associées, le système avertit que la suppression impactera les calculs.

---

## UC-08 — Voir le détail d'un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur un projet depuis le dashboard.

2. Le système affiche la page de détail avec :

   - Le récapitulatif des budgets et leur avancement.

   - La liste des dépenses du projet.

   - La liste des participants.

   - Un résumé des soldes de chaque participant.

### Scénarios alternatifs

- **Projet sans dépenses** : les sections dépenses et soldes affichent un état vide avec un message d'invitation à saisir la première dépense.

---

## UC-09 — Saisir une dépense

**Acteur** : Utilisateur (connecté)

**Include** : UC-09 (Répartir par participant)

### Scénario nominal

1. Depuis la page de détail d'un projet, l'utilisateur clique sur "Ajouter une dépense".

2. Il renseigne : nom, montant, date, catégorie et participant payeur.

3. Il définit quels participants sont concernés par la dépense et si la répartition est équitable ou non.

4. Il valide. Le système enregistre la dépense et met à jour les budgets et les soldes.

### Scénarios alternatifs

- **Montant manquant ou invalide** : le système bloque la validation.

- **Aucun participant sélectionné** : le système bloque la validation et indique qu'au moins un participant doit être concerné.

- **Catégorie sans budget** : la dépense est enregistrée mais aucun budget n'est impacté.


---

## UC-10 — Répartir une dépense par participant

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Lors de la saisie d'une dépense, l'utilisateur choisit les participants concernés.

2. Par défaut, la dépense est partagée équitablement entre tous les participants sélectionnés.

3. L'utilisateur peut modifier manuellement le montant attribué à chaque participant.

4. Le système vérifie que la somme des montants individuels correspond au total de la dépense.

5. L'utilisateur valide.

### Scénarios alternatifs

- **Somme incorrecte** : le système affiche un écart et bloque la validation tant que les montants ne correspondent pas au total.

- **Répartition automatique** : l'utilisateur peut recliquer sur "Répartir équitablement" pour réinitialiser les montants.

---

## UC-11 — Modifier ou supprimer une dépense

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la liste des dépenses, l'utilisateur sélectionne une dépense.

2. Il modifie les champs souhaités et valide.

3. Le système met à jour la dépense et recalcule les budgets et les soldes.

### Scénarios alternatifs

- **Suppression** : l'utilisateur clique sur "Supprimer" ; le système demande confirmation avant de supprimer définitivement et de recalculer les soldes.

---

## UC-12 — Voir les soldes et remboursements

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail d'un projet, l'utilisateur consulte la section remboursements.

2. Le système affiche le solde de chaque participant (ce qu'il a payé vs ce qu'il doit).

3. Le système affiche la liste optimisée des remboursements : qui doit combien à qui, avec un minimum de transactions.

### Scénarios alternatifs

- **Comptes équilibrés** : le système affiche un message indiquant qu'aucun remboursement n'est nécessaire.

- **Aucune dépense** : la section affiche un état vide.

--- 

## UC-13 — Consulter et gérer les alertes
 
**Acteur** : Utilisateur connecté
 
### Scénario nominal

1. Sur le dashboard, l'utilisateur voit dans le tableau des projets une colonne alerte avec une icône cloche et une pastille indiquant le nombre d'alertes non lues pour chaque projet.

2. Il clique sur un projet pour accéder à sa page de détail.

3. Un bandeau ou une notification signale les seuils d'alerte atteints sur ce projet.

4. L'utilisateur marque une alerte comme lue — elle disparaît de la vue principale.

5. Il peut accéder à l'onglet **Alertes** de la page de détail du projet pour consulter l'historique complet de toutes les alertes du projet, lues ou non lues.

### Scénarios alternatifs

- **Aucune alerte** : la cloche s'affiche sans pastille et l'onglet Alertes indique qu'aucune alerte n'a été déclenchée.

- **Plusieurs alertes non lues** : chaque alerte peut être marquée comme lue individuellement.

- **Alerte déjà lue** : visible dans l'historique de l'onglet Alertes mais n'apparaît plus dans la vue principale du projet.

---

## UC-14 — Archiver un projet
 
**Acteur** : Utilisateur connecté
 
### Scénario nominal

1. Depuis la page de détail d'un projet, l'utilisateur clique sur le bouton "Archiver le projet".

2. Le système demande confirmation avant d'archiver.

3. L'utilisateur confirme. Le projet passe en état archivé.

4. Le projet disparaît de la liste principale des projets sur le dashboard.

5. Il reste consultable depuis l'onglet **Archivés** du dashboard.

### Scénarios alternatifs

- **Annulation** : l'utilisateur annule la confirmation — le projet reste actif.

- **Consultation d'un projet archivé** : depuis l'onglet Archives, l'utilisateur peut accéder à la page de détail du projet en lecture seule.

- **Désarchivage** : depuis l'onglet Archives ou la page de détail, l'utilisateur peut restaurer le projet — il réapparaît dans la liste principale du dashboard.

---
