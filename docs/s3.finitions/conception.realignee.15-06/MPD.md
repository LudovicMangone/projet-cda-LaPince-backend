# Modèle physique de données : La Pince

> Version mise à jour post-développement (15/06/2026).
> Synchronisé avec le schéma Prisma réel de l'application.

```sql
BEGIN TRANSACTION;

-- ============================================================
-- DROP TABLES (reverse dependency order)
-- ============================================================

DROP TABLE IF EXISTS app_user_alert CASCADE;
DROP TABLE IF EXISTS operation_participant CASCADE;
DROP TABLE IF EXISTS project_participant CASCADE;
DROP TABLE IF EXISTS alert CASCADE;
DROP TABLE IF EXISTS budget CASCADE;
DROP TABLE IF EXISTS operation CASCADE;
DROP TABLE IF EXISTS participant CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

DROP TYPE IF EXISTS project_type;

-- ============================================================
-- ENUM : PROJECT_TYPE
-- Type de projet défini à la création et modifiable
-- Sert à catégoriser les projets dans l'interface (icône, filtre)
-- ============================================================

CREATE TYPE project_type AS ENUM (
    'Voyage',
    'Maison_Coloc',
    'Anniversaire',
    'Repas_Sortie',
    'Pro_Travail',
    'Autre'
);

-- ============================================================
-- APP_USER
-- Comptes utilisateurs enregistrés
-- ============================================================

CREATE TABLE app_user (
    id            INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,                  -- haché via Argon2
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORY
-- Catégories de dépenses prédéfinies, gérées uniquement par les devs
-- Pas de CRUD exposé dans le MVP (lecture seule via GET /api/categories)
-- ============================================================

CREATE TABLE category (
    id       INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    color    VARCHAR(7)   NOT NULL UNIQUE     -- couleur hexadécimale unique (#RRGGBB)
);

-- ============================================================
-- PROJECT
-- Enveloppe budgétaire partagée (voyage, coloc, cadeau commun…)
-- Un projet appartient à un seul utilisateur (pas de collaboration multi-compte en MVP)
-- ============================================================

CREATE TABLE project (
    id           INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         VARCHAR(100)  NOT NULL,
    description  TEXT,
    type         project_type  NOT NULL DEFAULT 'Voyage',   -- type de projet (ex: Voyage, Maison_Coloc…)
    is_archived  BOOLEAN       NOT NULL DEFAULT FALSE,
    app_user_id  INT           NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUDGET
-- Budget global optionnel lié à un projet (un seul budget par projet)
-- limit_criteria : pourcentage (1–100) au-delà duquel une alerte est déclenchée
-- Convention : limit_criteria = 100 signifie "alerte désactivée"
-- ============================================================

CREATE TABLE budget (
    id               INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    amount           DEC(10, 2)   NOT NULL CHECK (amount > 0),
    limit_criteria   DEC(5, 2)    NOT NULL CHECK (limit_criteria >= 1 AND limit_criteria <= 100),
    project_id       INT          NOT NULL UNIQUE REFERENCES project(id) ON DELETE CASCADE,  -- 1 budget max par projet
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALERT
-- Notification déclenchée automatiquement par le back
-- quand le total des dépenses dépasse le seuil du budget
-- Liée au budget qui l'a déclenchée
-- ============================================================

CREATE TABLE alert (
    id          INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status      VARCHAR(20)   NOT NULL DEFAULT 'unread'
                    CHECK (status IN ('unread', 'read', 'resolved')),
                -- unread   : nouvelle alerte non vue
                -- read     : vue par l'utilisateur
                -- resolved : le total est repassé sous le seuil après une suppression/modif
    message     TEXT          NOT NULL,
    budget_id   INT           NOT NULL REFERENCES budget(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- JUNCTION TABLE : APP_USER_ALERT (app_user <-> alert)
-- Dans le MVP : un seul utilisateur par projet, donc une alerte
-- est toujours liée à un seul app_user.
-- La table de liaison reste présente pour préparer la V2 multi-utilisateur.
-- ============================================================

CREATE TABLE app_user_alert (
    app_user_id   INT   NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    alert_id      INT   NOT NULL REFERENCES alert(id) ON DELETE CASCADE,
    PRIMARY KEY (app_user_id, alert_id)
);

-- ============================================================
-- PARTICIPANT
-- Personne impliquée dans les dépenses d'un projet
-- Peut être fictive (pas de compte) ou liée à un app_user (propriétaire)
-- Dans le MVP, le lien app_user_id sert à identifier le solde personnel
-- de l'utilisateur connecté dans chaque projet
-- ============================================================

CREATE TABLE participant (
    id           INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         VARCHAR(100)  NOT NULL,
    app_user_id  INT           REFERENCES app_user(id) ON DELETE SET NULL,  -- nullable : participant fictif
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- JUNCTION TABLE : PROJECT_PARTICIPANT (project <-> participant)
-- ============================================================

CREATE TABLE project_participant (
    project_id      INT   NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    participant_id  INT   NOT NULL REFERENCES participant(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, participant_id)
);

-- ============================================================
-- OPERATION
-- Transaction financière (dépense) enregistrée dans un projet
-- payer_participant_id : participant qui a avancé la totalité du montant
-- app_user_id          : utilisateur qui a saisi l'opération
-- is_amount_calculated : true = répartition calculée automatiquement (parts égales)
--                        false = saisie manuelle par l'utilisateur
-- ============================================================

CREATE TABLE operation (
    id                    INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                  VARCHAR(255)  NOT NULL,
    amount                DEC(10, 2)    NOT NULL CHECK (amount > 0),
    date                  DATE          NOT NULL DEFAULT CURRENT_DATE,
    is_amount_calculated  BOOLEAN       NOT NULL DEFAULT FALSE,
    payer_participant_id  INT           NOT NULL REFERENCES participant(id) ON DELETE RESTRICT,
    app_user_id           INT           NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    category_id           INT           NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    project_id            INT           NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- JUNCTION TABLE : OPERATION_PARTICIPANT
-- Répartition d'une opération entre les participants concernés
-- repartition_amount             : part due par ce participant (montant en €, >= 0)
-- is_repartition_amount_calculated : true = calculée automatiquement / false = saisie manuelle
-- Note : repartition_amount >= 0 (et non > 0) car une part peut être à 0
--        si un participant est inclus mais exempté du paiement
-- ============================================================

CREATE TABLE operation_participant (
    operation_id                    INT          NOT NULL REFERENCES operation(id) ON DELETE CASCADE,
    participant_id                  INT          NOT NULL REFERENCES participant(id) ON DELETE CASCADE,
    repartition_amount              DEC(10, 2)   NOT NULL CHECK (repartition_amount >= 0),
    is_repartition_amount_calculated BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (operation_id, participant_id)
);

COMMIT;
```

---

## Seed — Catégories (MVP)

Catégories prédéfinies insérées en base. Non modifiables par les utilisateurs.

```sql
INSERT INTO category (name, color) VALUES
-- Hébergement / vie quotidienne
('Hébergement', '#1E90FF'),
('Location', '#4169E1'),
('Logement', '#274C77'),
('Électricité', '#FFD700'),
('Eau', '#00BFFF'),
('Gaz', '#FFB703'),
('Internet', '#8ECAE6'),
('Assurance habitation', '#219EBC'),
('Charges copropriété', '#023047'),
('Entretien logement', '#457B9D'),
-- Transport
('Transport', '#FF8C00'),
('Transports en commun', '#FFA500'),
('Location de véhicules', '#FF7F50'),
('Carburant', '#FF4500'),
('Stationnement', '#CD5C5C'),
('Péages', '#D2691E'),
('Taxi / VTC', '#E76F51'),
('Train', '#F4A261'),
('Avion', '#E9C46A'),
('Entretien véhicule', '#A0522D'),
('Assurance véhicule', '#8B4513'),
-- Alimentation
('Restauration', '#32CD32'),
('Restaurants', '#228B22'),
('Courses', '#6B8E23'),
('Supermarché', '#556B2F'),
('Repas', '#7CFC00'),
('Livraison repas', '#3CB371'),
('Bars', '#2E8B57'),
('Café / snacks', '#66CDAA'),
-- Loisirs
('Loisir', '#9370DB'),
('Cinéma', '#8A2BE2'),
('Concerts', '#9932CC'),
('Sport', '#BA55D3'),
('Jeux vidéo', '#6A5ACD'),
('Streaming', '#7B68EE'),
('Voyages culturels', '#5B4FCF'),
-- Consommation personnelle
('Shopping', '#B8860B'),
('Vêtements', '#C71585'),
('Beauté / cosmétique', '#DB7093'),
('Santé / pharmacie', '#DC143C'),
('Équipement maison', '#BC8F8F'),
('Électronique', '#708090'),
-- Social
('Cadeaux', '#FF69B4'),
('Dons', '#FF1493'),
('Sorties entre amis', '#FFB6C1'),
('Restaurants sociaux', '#FF6347'),
-- Professionnel
('Travail', '#20B2AA'),
('Frais professionnels', '#1A6B45'),
('Matériel informatique', '#00CED1'),
('Logiciels / SaaS', '#48D1CC'),
('Formation', '#40E0D0'),
-- Finance / administration
('Remboursements', '#607080'),
('Impôts', '#2F4F4F'),
('Banque / frais bancaires', '#4A5E3A'),
('Amendes', '#8B0000'),
('Crédits / prêts', '#800000'),
-- Fallback
('Divers', '#A9A9A9');
```

---

## Notes sur les différences avec la version S0

| Élément | S0 (conception) | Réel (application) |
|---|---|---|
| `project.type` | Absent | Enum `project_type` ajouté |
| Timestamps | Absents | `created_at` / `updated_at` sur toutes les tables principales |
| `operation.is_amount_calculated` | Absent | Ajouté — distingue répartition auto vs manuelle |
| `operation_participant.is_repartition_amount_calculated` | Absent | Ajouté — distingue part auto vs saisie manuelle |
| `alert.status` CHECK | `IN ('unread','read')` | `IN ('unread','read','resolved')` — le statut `resolved` est passé automatiquement quand le total redescend sous le seuil |
| `operation_participant.repartition_amount` CHECK | `> 0` | `>= 0` — une part à 0 est autorisée |
| Budget par catégorie | Prévu | Non implémenté — un seul budget global par projet (`UNIQUE` sur `project_id`) |
