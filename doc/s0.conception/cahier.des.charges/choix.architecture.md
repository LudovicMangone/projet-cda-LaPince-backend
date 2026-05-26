# Le choix et la justification de l'architecture du projet (front, back, BDD)

## Structure du projet

Pas de monorepo : 
* Un repository back-end
* Un repository front-end

Nous aurons une architecture 3 tiers (ou client / serveur en couches) afin de séparer : la présentation (le client) / la logique métier (api) / les données (la BDD).
Cela nous permet d'avoir des responsabilités techniques claires et séparées, avec des responsabilités réparties entre chaque système pour une meilleure solidité ainsi qu’une maintenabilité accrue.


---

## Front-end

### Technologies choisies

* React
* React Router
* TypeScript
* Pas de Docker côté front

---

### Pourquoi ?

Pas de Docker dans un premier temps afin de ne pas complexifier la partie front-end.
Le HTML et le CSS sont bien supportés sans conteneurisation dans le cadre du projet.

Choix de React afin de développer l’application sous forme de SPA (*Single Page Application*), avec l’utilisation de React Router pour la gestion du routage.
Il permet aussi de construire l’interface sous forme de composants indépendants et réutilisables. React est adapté aux interfaces dynamiques grâce à son système déclaratif et à sa gestion de l’état, qui correspond à l'usage de dashboard, vues filtrées, mise à jour des dépenses etc.

Ce choix permet également de continuer à pratiquer React “classique” avant d’utiliser Next.js, qui apporte davantage d’abstraction. Et il dispose d’un très bon support TypeScript.

L’utilisation de TypeScript permet de sécuriser davantage le projet grâce au typage statique, notamment en limitant les déductions implicites de JavaScript et les erreurs de typage au runtime. Cela améliore également la lisibilité du code, l’autocomplétion et la maintenabilité globale de l’application.

---

## Back-end

Nous utiliserons une architecture organisée en couches appliquant les principes de *Separation of Concerns* (SoC) : séparation claire des responsabilités entre routes, contrôleurs, services, accès aux données et logique métier afin d’améliorer la maintenabilité, la lisibilité et l’évolutivité du projet.

### Technologies choisies

* Docker
* Node.js
* Express.js en API REST
* TypeScript
* PostgreSQL
* Prisma ORM

---

### Pourquoi ?

#### Docker

Docker est utilisé afin de sécuriser le travail collaboratif entre les différentes machines et versions des outils utilisés par les membres de l’équipe.

---

#### Node.js + Express

Express est un framework minimaliste et très lisible, avec une grande communauté et une documentation très riche. Il est stable et très compatible avec nos autres stacks.

Le choix de Node.js + Express permet également :

* d’isoler clairement la pratique back-end,
* d’avoir une approche avec peu d’abstraction,
* de travailler les principes d’architecture en couches et SoC (*Separation of Concerns*),
* de conserver une architecture claire et pédagogique,

L’ajout de TypeScript permet également de renforcer la fiabilité du projet côté back-end grâce à un typage strict, en évitant autant que possible les comportements implicites et les déductions parfois imprécises de JavaScript. Cela facilite également la maintenance, la détection d’erreurs lors du développement et la cohérence des contrats de données entre les différentes couches de l’application.

---

#### PostgreSQL

Le choix d’une base de données relationnelle (SGBDR) avec PostgreSQL est motivé par le besoin de cohérence des données entre les différentes tables et relations du projet.

Certaines données doivent rester contrôlées par l’application.
Par exemple, l’utilisateur ne pourra utiliser que des catégories existantes et ne pourra pas en créer librement certaines données métier.

Le projet nécessite également une gestion relationnelle forte entre plusieurs entités :

* participants
* projets
* opérations
* limites de budget
* alertes
* dashboard

---

#### Prisma ORM

Le choix de Prisma permet :

* de travailler avec un projet fortement typé,
* de pratiquer l’utilisation d’un ORM moderne,
* de centraliser les modèles dans un unique fichier de schéma,
* de simplifier la gestion des requêtes relationnelles et agrégées.

Prisma apporte également une approche plus lisible et maintenable que des requêtes SQL écrites manuellement.

