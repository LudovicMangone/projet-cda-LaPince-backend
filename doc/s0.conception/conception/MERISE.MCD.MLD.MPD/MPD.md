# Modèle physique de données : La Pince

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

-- ============================================================
-- APP_USER
-- Stores registered app_user accounts
-- ============================================================

CREATE TABLE app_user (
    id            INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,                  -- name or pseudo
    email         VARCHAR(255)  NOT NULL UNIQUE,           -- unique eemail address used for login
    password      VARCHAR(255)  NOT NULL                  -- argon2 hashed password
);

-- ============================================================
-- CATEGORY
-- Expense categorys with non optional parent/child self-reference for the moment
-- ============================================================

CREATE TABLE category (
    id                   INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                 VARCHAR(100)  NOT NULL,                                   -- category label
    color                VARCHAR(7)   NOT NULL UNIQUE                             -- category unique color
);

-- ============================================================
-- PROJECT
-- A shared budget envelope (e.g. Milan trip, flatshare, gift pool)
-- Each project is created by one app_user with no collaborative option in the MVP
-- ============================================================

CREATE TABLE project (
    id              INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,                                            -- project name
    description     TEXT,                                                              -- project description
    is_archived     BOOLEAN       DEFAULT FALSE,                                       -- project is archived toggle
    app_user_id     INT           NOT NULL REFERENCES app_user(id) ON DELETE CASCADE   -- creator
);

-- ============================================================
-- BUDGET
-- Spending limit optionally linked to a project
-- limit_criteria is a percentage (0-100) that triggers an alert
-- ============================================================

CREATE TABLE budget (
    id                INT             GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    amount            DEC(10, 2)      NOT NULL CHECK (amount > 0),                                          -- budget ceiling amount
    limit_criteria    DEC(5, 2)       NOT NULL CHECK (limit_criteria > 0 AND limit_criteria <= 100),        -- alert threshold in percent
    project_id        INT             NOT NULL REFERENCES project(id) ON DELETE CASCADE                    -- link to a project
);

-- ============================================================
-- ALERT
-- Notification triggered when a budget threshold is reached
-- Always linked to the budget that triggered it
-- ============================================================

CREATE TABLE alert (
    id          INT            GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status      VARCHAR(20)    NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),   -- read/unread status
    message     TEXT           NOT NULL,                                                         -- alert message displayed to the app_user
    budget_id   INT            NOT NULL REFERENCES budget(id) ON DELETE CASCADE                  -- budget that triggered this alert, if budget is deleted, alert is removed
);

-- ============================================================
-- JUNCTION TABLE: APP_USER_ALERT (app_user <-> alert)
-- Tracks which app_users receive which alerts (many-to-many)
-- ============================================================

CREATE TABLE app_user_alert (
    app_user_id     INT     NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    alert_id        INT     NOT NULL REFERENCES alert(id) ON DELETE CASCADE,
    PRIMARY KEY (app_user_id, alert_id)
);

-- ============================================================
-- PARTICIPANT
-- A person involved in a project expense
-- May or may not have a app_user account (not a collaborative projet in MVP, only app_user can use and modify projects)
-- ============================================================

CREATE TABLE participant (
    id              INT            GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(100)   NOT NULL,                                                  -- participant display name
    app_user_id     INT            REFERENCES app_user(id) ON DELETE SET NULL                 -- linked app_user account (nullable in MVP)
);

-- ============================================================
-- JUNCTION TABLE: PROJECT_PARTICIPANT (project <-> participant)
-- Lists all participants belonging to a project (many-to-many)
-- ============================================================

CREATE TABLE project_participant (
    project_id         INT      NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    participant_id     INT      NOT NULL REFERENCES participant(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, participant_id)
);

-- ============================================================
-- OPERATION
-- A financial transaction (expense or income) within a project
-- payer_participant_id: the participant who paid upfront
-- ============================================================

CREATE TABLE operation (
    id                    INT            GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                  VARCHAR(255)   NOT NULL,                                                  -- operation label
    amount                DEC(10, 2)     NOT NULL CHECK (amount > 0),                               -- total amount
    date                  DATE           NOT NULL DEFAULT CURRENT_DATE,                             -- date of the expense
    payer_participant_id  INT            NOT NULL REFERENCES participant(id) ON DELETE RESTRICT,    -- participant who paid the full amount upfront
    app_user_id           INT            NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,        -- app_user who recorded the operation
    category_id           INT            NOT NULL REFERENCES category(id) ON DELETE RESTRICT,       -- expense category (required)
    project_id            INT            NOT NULL REFERENCES project(id) ON DELETE RESTRICT         -- project this operation belongs to (required)

);

-- ============================================================
-- JUNCTION TABLE: OPERATION_PARTICIPANT
-- Splits an operation amount across multiple participants
-- repartition_amount: the share amount owed by each participant
-- ============================================================

CREATE TABLE operation_participant (
    operation_id        INT             NOT NULL REFERENCES operation(id) ON DELETE CASCADE,
    participant_id      INT             NOT NULL REFERENCES participant(id) ON DELETE CASCADE,
    repartition_amount  DEC(10,2)       NOT NULL CHECK (repartition_amount > 0),  -- amount owed by this participant
    PRIMARY KEY (operation_id, participant_id)
);

COMMIT;
```

## Première bases sur les catégories possibles :

```sql
-- ============================================================
-- SEED - CATEGORY (MVP fixed categories + extended coverage)
-- ============================================================
INSERT INTO category (name, color) VALUES
-- ============================================================
-- Housing / daily life
-- ============================================================
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
-- ============================================================
-- Transport
-- ============================================================
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
-- ============================================================
-- Food
-- ============================================================
('Restauration', '#32CD32'),
('Restaurants', '#228B22'),
('Courses', '#6B8E23'),
('Supermarché', '#556B2F'),
('Repas', '#7CFC00'),
('Livraison repas', '#3CB371'),
('Bars', '#2E8B57'),
('Café / snacks', '#66CDAA'),
-- ============================================================
-- Leisure / lifestyle
-- ============================================================
('Loisir', '#9370DB'),
('Cinéma', '#8A2BE2'),
('Concerts', '#9932CC'),
('Sport', '#BA55D3'),
('Jeux vidéo', '#6A5ACD'),
('Streaming', '#7B68EE'),
('Voyages culturels', '#5B4FCF'),   -- corrigé : était #9370DB (doublon Loisir)
-- ============================================================
-- Personal consumption
-- ============================================================
('Shopping', '#B8860B'),
('Vêtements', '#C71585'),
('Beauté / cosmétique', '#DB7093'),
('Santé / pharmacie', '#DC143C'),
('Équipement maison', '#BC8F8F'),
('Électronique', '#708090'),
-- ============================================================
-- Social
-- ============================================================
('Cadeaux', '#FF69B4'),
('Dons', '#FF1493'),
('Sorties entre amis', '#FFB6C1'),
('Restaurants sociaux', '#FF6347'),
-- ============================================================
-- Work / professional
-- ============================================================
('Travail', '#20B2AA'),
('Frais professionnels', '#1A6B45'),  -- corrigé : était #2E8B57 (doublon Bars)
('Matériel informatique', '#00CED1'),
('Logiciels / SaaS', '#48D1CC'),
('Formation', '#40E0D0'),
-- ============================================================
-- Finance / administration
-- ============================================================
('Remboursements', '#607080'),        -- corrigé : était #708090 (doublon Électronique)
('Impôts', '#2F4F4F'),
('Banque / frais bancaires', '#4A5E3A'), -- corrigé : était #556B2F (doublon Supermarché)
('Amendes', '#8B0000'),
('Crédits / prêts', '#800000'),
-- ============================================================
-- UX fallback category
-- ============================================================
('Divers', '#A9A9A9');

```