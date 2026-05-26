# Dictionnaire de données — La Pince

Choix du SGBDR : PostgreSQL

---

## Pour toutes les tables

* `id` = `INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY`
* Ajout des champs via Prisma:

  * `created_at` : `TIMESTAMPTZ DEFAULT NOW()`
  * `updated_at` : `TIMESTAMPTZ DEFAULT NOW()`

Notes :

* `DEC(10,2)` est utilisé pour tous les montants financiers afin d’éviter les erreurs de précision des nombres flottants.
* Les tables de liaison utilisent des clés primaires composites.
* Les suppressions utilisent différents comportements (`CASCADE`, `SET NULL`, `RESTRICT`) selon les besoins métier.

---

# Table `app_user`

| Champ       | Type         | Unique | Not null | Référence | Par défaut | Exemple de valeur                         | Explication                              |
| ----------- | ------------ | ------ | -------- | --------- | ---------- | ----------------------------------------- | ---------------------------------------- |
| `id`        | GENERATED    | ✅     | ✅       | -         | -          | 1                                         | Identifiant unique de l’utilisateur      |
| `name`      | VARCHAR(100) | ❌     | ✅       | -         | -          | "Alice"                                   | Nom ou pseudo de l’utilisateur           |
| `email`     | VARCHAR(255) | ✅     | ✅       | -         | -          | "[alice@mail.com](mailto:alice@mail.com)" | Adresse email utilisée pour la connexion |
| `password`  | VARCHAR(255) | ❌     | ✅       | -         | -          | "$argon2id$..."                           | Mot de passe haché avec Argon2           |


---

# Table `category`

| Champ   | Type         | Unique | Not null | Référence | Par défaut | Exemple de valeur | Explication                        |
| ------- | ------------ | ------ | -------- | --------- | ---------- | ----------------- | ---------------------------------- |
| `id`    | GENERATED    | ✅     | ✅       | -         | -          | 1                 | Identifiant unique de la catégorie |
| `name`  | VARCHAR(100) | ❌     | ✅       | -         | -          | "Transport"       | Nom de la catégorie                |
| `color` | VARCHAR(7)   | ✅     | ✅       | -         | -          | "#FF8C00"         | Couleur associée à la catégorie    |

---

# Table `project`

| Champ         | Type         | Unique | Not null | Référence    | Par défaut | Exemple de valeur   | Explication                |
| ------------- | ------------ | ------ | -------- | ------------ | ---------- | ------------------- | -------------------------- |
| `id`          | GENERATED    | ✅     | ✅       | -            | -          | 10                  | Identifiant du projet      |
| `name`        | VARCHAR(100) | ❌     | ✅       | -            | -          | "Voyage Milan"      | Nom du projet              |
| `description` | TEXT         | ❌     | ❌       | -            | -          | "Voyage entre amis" | Description du projet      |
| `is_archived` | BOOLEAN      | ❌     | ✅       | -            | `false`    | `true`              | État d’archivage du projet, une fois archivé il n'est plus modifiable. Peut être desarchivé |
| `app_user_id` | INT          | ❌     | ✅       | app_user(id) | -          | 1                   | Créateur du projet         |

---

# Table `budget`

| Champ            | Type      | Unique | Not null | Référence   | Par défaut | Exemple de valeur | Explication                           |
| ---------------- | --------- | ------ | -------- | ----------- | ---------- | ----------------- | ------------------------------------- |
| `id`             | GENERATED | ✅     | ✅       | -           | -          | 4                 | Identifiant du budget                 |
| `amount`         | DEC(10,2) | ❌     | ✅       | -           | -          | 1200.00           | Montant maximum autorisé              |
| `limit_criteria` | DEC(5,2)  | ❌     | ✅       | -           | 80.00      | 75.00             | Pourcentage de déclenchement d’alerte entre 1 et 100% du montant |
| `project_id`     | INT       | ❌     | ✅       | project(id) | -          | 1                 | Projet lié au budget                  |

---

# Table `alert`

| Champ       | Type        | Unique | Not null | Référence  | Par défaut | Exemple de valeur | Explication                     |
| ----------- | ----------- | ------ | -------- | ---------- | ---------- | ----------------- | ------------------------------- |
| `id`        | GENERATED   | ✅     | ✅       | -          | -          | 8                 | Identifiant de l’alerte         |
| `status`    | VARCHAR(20) | ❌     | ✅       | -          | `'unread'` | "read"            | Statut de lecture de l’alerte   |
| `message`   | TEXT        | ❌     | ✅       | -          | -          | "Budget dépassé"  | Message affiché à l’utilisateur |
| `budget_id` | INT         | ❌     | ✅       | budget(id) | -          | 4                 | Budget ayant déclenché l’alerte |

---

# Table `app_user_alert`

| Champ         | Type | Unique | Not null | Référence    | Par défaut | Exemple de valeur | Explication                   |
| ------------- | ---- | ------ | -------- | ------------ | ---------- | ----------------- | ----------------------------- |
| `app_user_id` | INT  | ❌     | ✅       | app_user(id) | -          | 1                 | Utilisateur recevant l’alerte |
| `alert_id`    | INT  | ❌     | ✅       | alert(id)    | -          | 8                 | Alerte reçue                  |

---

# Table `participant`

| Champ         | Type         | Unique | Not null | Référence    | Par défaut | Exemple de valeur | Explication                                        |
| ------------- | ------------ | ------ | -------- | ------------ | ---------- | ----------------- | -------------------------------------------------- |
| `id`          | GENERATED    | ✅     | ✅       | -            | -          | 12                | Identifiant du participant                         |
| `name`        | VARCHAR(100) | ❌     | ✅       | -            | -          | "Thomas"          | Nom affiché du participant                         |
| `app_user_id` | INT          | ❌     | ❌       | app_user(id) | NULL       | 1                 | Compte utilisateur associé (optionnel dans le MVP), un bouton "moi" permet d'ajouter d'ajouter le app_user comme participant en ajoutant automatiquement son nom et ratache son app_user_id |

---

# Table `project_participant`

| Champ            | Type | Unique | Not null | Référence       | Par défaut | Exemple de valeur | Explication                   |
| ---------------- | ---- | ------ | -------- | --------------- | ---------- | ----------------- | ----------------------------- |
| `project_id`     | INT  | ❌     | ✅       | project(id)     | -          | 1                 | Projet concerné               |
| `participant_id` | INT  | ❌     | ✅       | participant(id) | -          | 12                | Participant associé au projet |

---

# Table `operation`

| Champ                  | Type         | Unique | Not null | Référence       | Par défaut     | Exemple de valeur | Explication                                                                                                                  |
| ---------------------- | ------------ | ------ | -------- | --------------- | -------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | GENERATED    | ✅     | ✅       | -               | -              | 25                | Identifiant de l’opération                                                                                                   |
| `name`                 | VARCHAR(255) | ❌     | ✅       | -               | -              | "Restaurant"      | Nom de l’opération                                                                                                           |
| `amount`               | DEC(10,2)    | ❌     | ✅       | -               | -              | 84.50             | Montant total de l’opération                                                                                                 |
| `date`                 | DATE         | ❌     | ✅       | -               | `CURRENT_DATE` | "2026-05-20"      | Date du jour au moment de la saisie, l'utilisateur peut la modifier (backdating une dépense passée)                          |
| `payer_participant_id` | INT          | ❌     | ✅       | participant(id) |                | 12                | Participant ayant avancé la somme                                                                                            |
| `app_user_id`          | INT          | ❌     | ✅       | app_user(id)    | -              | 1                 | Utilisateur ayant créé l’opération                                                                                           |
| `category_id`          | INT          | ❌     | ✅       | category(id)    | id de 'Divers' | 2                 | Catégorie associée. Si aucune catégorie n'est sélectionnée par l'utilisateur, la valeur par défaut est la catégorie "Divers" |
| `project_id`           | INT          | ❌     | ✅       | project(id)     | -              | 1                 | Projet associé                                                                                                               |

---

# Table `operation_participant`

| Champ                | Type      | Unique | Not null | Référence       | Par défaut | Exemple de valeur | Explication                   |
| -------------------- | --------- | ------ | -------- | --------------- | ---------- | ----------------- | ----------------------------- |
| `operation_id`       | INT       | ❌     | ✅       | operation(id)   | -          | 25                | Opération concernée           |
| `participant_id`     | INT       | ❌     | ✅       | participant(id) | -          | 12                | Participant concerné          |
| `repartition_amount` | DEC(10,2) | ❌     | ✅       | -               | -          | 42.25             | Montant dû par le participant |
