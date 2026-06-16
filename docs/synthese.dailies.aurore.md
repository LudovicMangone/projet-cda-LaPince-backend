# Synthèse des dailies — Aurore

Document de synthèse des actions réalisées par Aurore, construit à partir des dailies individuelles, carnets de bord collectifs et documents de suivi présents dans `docs/`.

## Sprint 0 — Conception

### 18/05/2026 — Sprint 0 / Day 1

* Participation au lancement du projet d'apothéose et aux premiers échanges d'équipe.
* Prise du rôle de Lead Dev.
* Participation à la définition de l'organisation de travail :
  * workflow Git avec branches `main`, `dev` et branches de features ;
  * Pull Requests obligatoires avant merge ;
  * utilisation de GitHub Projects ;
  * création d'un dossier `docs/` pour centraliser les documents projet.
* Participation à la définition du périmètre fonctionnel du projet :
  * gestion de dépenses de groupe ;
  * suivi budgétaire ;
  * alertes de dépassement ;
  * calcul des remboursements entre participants.
* Contribution aux premiers choix techniques :
  * séparation front-end / back-end ;
  * architecture 3 tiers ;
  * React, React Router et TypeScript côté front ;
  * Node.js, Express, PostgreSQL et Prisma côté back.
* Participation à la définition des conventions de nommage des fichiers.
* Identification des priorités de conception : MCD et wireframes.
* Attribution du MCD à Ludovic et Aurore.

### 19/05/2026 — Sprint 0 / Day 2

* Travail personnel de réflexion sur le MCD avec Mocodo.
* Arbitrage sur les typologies de dépenses :
  * l'utilisateur ne pourra pas créer librement de nouvelles typologies ;
  * les typologies existantes seront contrôlées par l'application.
* Réflexion sur les catégories parent/enfant et leur place dans le modèle.
* Réflexion sur le budget optionnel :
  * budget global projet ;
  * budget par catégorie ;
  * possibilité de ne pas définir de budget.
* Participation au point collectif d'analyse des wireframes et du MCD.
* Ajout au MCD :
  * notion de participant ;
  * suppression des rôles ;
  * ajout de nouvelles relations.
* Conservation de l'entité `Alerte` afin de garder un historique des notifications.
* Ajout d'un statut lu / non lu pour les alertes.
* Relecture des cardinalités du MCD.
* Envoi du MCD mis à jour en issue.
* Participation au point avec l'équipe encadrante.
* Intégration des retours pédagogiques :
  * sous-catégories à sortir du MVP ;
  * liens entre opérations et répartition des montants à revoir.
* Participation à l'analyse des risques :
  * sécurité ;
  * facteurs humains ;
  * plan B si la répartition des dépenses n'aboutit pas.
* Rédaction / consolidation de la partie choix d'architecture :
  * architecture 3 tiers ;
  * séparation des responsabilités ;
  * choix React / TypeScript ;
  * choix Node.js / Express / PostgreSQL / Prisma ;
  * justification de Docker côté back.
* Rédaction / consolidation de la liste des technologies utilisées.

### 20/05/2026 — Sprint 0 / Day 3

* Mise à jour des documents :
  * choix d'architecture ;
  * stack technique.
* Travail sur le MLD :
  * réflexion sur `participant.user_id` ;
  * identification du caractère optionnel en MVP ;
  * anticipation d'une obligation possible en version collaborative.
* Finalisation du MPD et envoi à l'équipe.
* Relecture globale des modèles de données.
* Identification de champs manquants dans certaines tables.
* Discussion sur l'arborescence des entités et leur cohérence.
* Participation aux arbitrages techniques :
  * les types de projet deviennent des valeurs fixes ;
  * pas d'entité dédiée aux types de projet dans le MVP.
* Participation à la préparation de l'oral de présentation.

### 21/05/2026 — Sprint 0 / Day 4

* Rédaction de la liste des navigateurs compatibles.
* Rédaction du dictionnaire de données.
* Participation au point collectif sur la complexité de la répartition des dépenses.
* Travail personnel important sur la logique de calcul des balances et remboursements.
* Création d'un document de réflexion sur la répartition des dettes contenant :
  * les tables concernées ;
  * des exemples de calcul de balances ;
  * des visualisations de répartition des montants ;
  * une première logique procédurale de remboursement.
* Distinction entre :
  * les calculs mathématiques simples sur les montants ;
  * la logique algorithmique déterminant qui rembourse qui.
* Identification avec Ludovic d'une approche par algorithme glouton.
* Partage du document de réflexion à l'équipe.
* Participation au point avec l'équipe encadrante sur les diagrammes de séquence.
* Intégration des retours sur la granularité des diagrammes et les boîtes d'activation.
* Participation à la décision sur le stockage du dark mode côté client via `localStorage`.

### 22/05/2026 — Sprint 0 / Day 5

* Participation aux échanges sur le diagramme d'architecture, la CI/CD et les workflows qualité.
* Réflexion sur l'éco-conception et l'impact algorithmique.
* Choix d'une première approche gloutonne pour :
  * réduire le nombre de transactions ;
  * limiter les opérations inutiles ;
  * optimiser les remboursements entre participants.
* Mise au propre du fichier de réflexion sur la répartition des dépenses.
* Structuration des calculs de balances.
* Rédaction du pseudo-code de la logique de remboursement.
* Réflexion personnelle sur l'organisation du sprint suivant :
  * répartition en binômes front/back ;
  * checklists de mise en place ;
  * responsabilités individuelles ;
  * validations croisées via Pull Requests.
* Proposition d'un découpage step-by-step du projet :
  * initialisation ;
  * Docker ;
  * schéma Prisma ;
  * seed ;
  * configuration des outils ;
  * Pull Request par étape.
* Réflexion sur un rôle de Git Master rattaché au Lead Dev.
* Rédaction d'un guide Lead Dev & Git Master :
  * modèle de branches ;
  * règles sur `main`, `dev` et branches de features ;
  * organisation des repositories front/back ;
  * conventions et workflows Git.
* Participation au point pédagogique sur :
  * responsive design ;
  * sécurité ;
  * RGPD ;
  * accessibilité ;
  * UX ;
  * statuts HTTP ;
  * bonnes pratiques Git.

## Sprint 1 — Mise en place technique

### 26/05/2026 — Sprint 1 / Day 1

* Travail collectif sur la mise en place de l'environnement de développement front.
* Mise en place / configuration des outils :
  * Biome pour lint et format ;
  * formatage automatique à la sauvegarde via VSCode ;
  * Husky pour les pre-commit hooks ;
  * GitHub Actions pour CI ;
  * Vitest et fichiers de configuration de tests.
* Tests collaboratifs du workflow Git :
  * push ;
  * création de Pull Request ;
  * validation du workflow de contribution.
* Travail sur la mise en place backend :
  * initialisation d'Express sur une branche de test ;
  * démarrage du socle backend.
* Participation à la décision de downgrade temporaire de Prisma 7 vers Prisma 6 à cause d'une vulnérabilité identifiée.
* Mise à jour des documents techniques en conséquence.
* Début de mise en place de l'infrastructure Docker :
  * Dockerfile ;
  * docker-compose.

### 27/05/2026 — Sprint 1 / Day 2

* Prise en charge du sujet sécurité backend et middlewares.
* Mise en place du middleware de gestion des erreurs 404.
* Rédaction d'une documentation d'explication du middleware et de la librairie d'erreurs pour l'équipe.
* Mise en place d'un utilitaire de configuration pour les variables d'environnement, avec erreur si une variable obligatoire est absente.
* Installation et configuration de middlewares de sécurité :
  * `cors` ;
  * `xss sanitizer` ;
  * `helmet` ;
  * `body-parser` avec limite ;
  * `express-rate-limit`.
* Participation au debug des GitHub Actions.
* Participation aux échanges sur Prisma 6 / Prisma 7 et retour à Prisma 7 après analyse de la vulnérabilité.
* Planification de la suite :
  * sécurité backend ;
  * README ;
  * RGPD ;
  * dashboard si avancement suffisant.
* Rédaction d'explications techniques sur :
  * `HttpError` ;
  * les classes d'erreurs personnalisées ;
  * l'héritage avec `Error` ;
  * le middleware global de gestion des erreurs.

### 28/05/2026 — Sprint 1 / Day 3

* Mise à jour du README :
  * variables `.env` ;
  * architecture projet ;
  * scripts Docker.
* Ajout des documents RGPD.
* Création des carnets de bord :
  * version rétroactive ;
  * structure pour les prochains jours.
* Début de la feature front RGPD.
* Passage en strict mode.
* Participation à la clarification de l'architecture backend :
  * services pour la logique métier et les appels BDD ;
  * controllers dédiés à la gestion HTTP.
* Prise en compte des rappels pédagogiques :
  * mobile first ;
  * responsive design ;
  * accessibilité ;
  * dailies individuelles et collectives.

### 29/05/2026 — Sprint 1 / Day 4

* Poursuite de l'intégration front de la page RGPD.
* Gestion des premiers conflits rencontrés sur les Pull Requests.
* Création d'une issue front liée à une route back existante :
  * `[BACK] GET /api/projects/:id — détail + ownership + 403/404` ;
  * `[FRONT] Affichage du détail d'un projet`.
* Identification des futures tâches de liaison front/back.
* Mise en place de la route `GET /api/projects/:id`.
* Sécurisation de la route projet :
  * `authGuard` ;
  * contrôle du propriétaire ;
  * gestion des erreurs 401, 403 et 404.
* Ajout d'un enrichissement des erreurs 500 en mode développement :
  * debug Prisma ;
  * stack trace.
* Ajout de données de seed pour tests manuels :
  * cas owner ;
  * cas non-owner.
* Ajout des tests unitaires et d'intégration de la route projet dans le backlog.
* Correction de problèmes liés au formatage Biome.
* Résolution de conflits d'indentation sur certaines PR.
* PR et fixes associés.

### 01/06/2026 — Sprint 1 / Day 5

* Mise en place du `ProjectsProvider`.
* Réflexion sur l'architecture des contexts :
  * provider dédié à un projet unique ;
  * provider dédié à la collection de projets.
* Décision de conserver un provider unique pour gérer les projets.
* Mise en place de l'appel API `GET /projects/:id` pour hydrater la page détail.
* Hydratation de base de la page projet.
* Hydratation du composant Participants en cours.
* Finalisation de l'hydratation prévue dans la carte Kanban.
* Mise en commentaire des parties déjà intégrées mais pas encore dynamiques.
* Mise en place de la redirection vers la page de connexion pour les pages protégées.
* Gestion des erreurs 403 et 404 côté front.
* Démarrage du composant de détail de projet `ProjectById`.
* Préparation des routes backend :
  * `PATCH /api/projects/:id` ;
  * `DELETE /api/projects/:id`.
* Rédaction des TODO techniques associés.
* Analyse d'un écart entre les maquettes et le modèle de données :
  * les maquettes prévoient tag/catégorie sur projet ;
  * le modèle ne prévoit les catégories que sur les opérations.
* Décision de masquer le bouton concerné et de reporter la fonctionnalité à une évolution ultérieure.
* Préparation de la présentation du Sprint 2 confiée à Aurore.

## Sprint 2 — Développement des fonctionnalités

### 02/06/2026 — Sprint 2 / Day 1

* Présentation du Sprint 1 confiée à Aurore.
* Mise en place du middleware de validation des données avec Zod pour la modification de projet.
* Vérification de l'existence du projet avant modification.
* Vérification de l'ownership avant modification.
* Finalisation de la logique de mise à jour du projet.
* Ajout du budget comme donnée optionnelle dans la requête PATCH.
* Mise en place de la gestion create/update du budget via Prisma.
* Réflexion sur la récupération des données budget côté front :
  * route dédiée ;
  * ou enrichissement de la route projet.
* Décision de centraliser les données dans `GET /api/projects/:id`.
* Échange avec l'équipe sur le type de projet.
* Validation du choix d'un enum Prisma plutôt qu'une relation avec `Category`.
* Merge du travail de Jérémy sur le schéma Prisma.
* Résolution des conflits liés au merge.
* Mise en place de la route de suppression d'un projet.
* Réflexion sur la règle métier de suppression :
  * suppression interdite si données associées ;
  * ou suppression en cascade.
* Décision d'autoriser la suppression en cascade.
* Mise à jour du schéma Prisma pour refléter ce comportement.
* Identification de difficultés sur les contraintes `onDelete` et les migrations Prisma.

### 03/06/2026 — Sprint 2 / Day 2

* Analyse et validation de la PR backend `PATCH / DELETE projects/:id`.
* Merge de la PR.
* Réflexion sur l'édition des détails projet directement dans la page plutôt que dans une modale.
* Participation aux choix d'architecture de la page détail projet.
* Dynamisation de la page de détail d'un projet.
* Mise en place du lien dynamique entre le slider du seuil d'alerte et la valeur affichée.
* Gestion de l'activation et de la désactivation du budget et du seuil d'alerte.
* Réflexion sur la fusion de types participants :
  * `IProjectParticipants[]` ;
  * `IOperationParticipant[]`.
* Mise en attente de cette fusion car les structures restent différentes.
* Mise en place d'un mode consultation sur la fiche projet :
  * champs verrouillés par défaut ;
  * bouton Modifier pour déverrouiller ;
  * formulaire éditable ensuite.
* Ajustement du style des composants UI pour rendre l'état désactivé plus visible.
* Migration progressive des champs non contrôlés vers des champs contrôlés.
* Résolution de problèmes de typage sur :
  * formulaire ;
  * états React ;
  * données de budget.
* Début du mécanisme de mise à jour d'un projet via appel PATCH côté front.
* Correction d'incohérences de typage entre front-end et API.
* Participation à l'analyse et l'intégration de PR frontend :
  * harmonisation de nomenclature ;
  * fusion de `ParticipantStack` ;
  * intégration de `QueryClientProvider` ;
  * intégration de nouveaux providers ;
  * fusion de `api.ts` avec endpoints Budget, Balance, Catégories, Opérations et Projets ;
  * correction de `OperationsRow`.

### 04/06/2026 — Sprint 2 / Day 3

* Mise à jour du README avec des précisions sur le fonctionnement du back-end.
* Modification du formulaire projet :
  * budget affiché seulement lorsque l'alerte budgétaire est active ;
  * suppression du champ "budget maximum par participant".
* Mise en place de l'édition des participants du projet avec le même modèle que le formulaire des détails projet.
* Utilisation de champs contrôlés pour les participants.
* Mise en place du comportement de suppression des participants.
* Résolution de difficultés liées aux différences entre :
  * formats renvoyés par le back-end ;
  * typages TypeScript côté front.
* Identification de sujets à traiter ultérieurement :
  * comportement par défaut du budget ;
  * autorisation correcte de la valeur `0` ;
  * refactorisation possible des `onChange` ;
  * problème de liste déroulante des types de projet.

### 05/06/2026 — Sprint 2 / Day 4

* Ajout et configuration de l'extension GitHub Pull Requests dans VS Code.
* Mise en place des appels API côté front pour la mise à jour des participants d'un projet.
* Développement backend de la route `PATCH /api/projects/:id/participants`.
* Implémentation du contrôleur associé.
* Création du service de gestion des participants.
* Intégration de la logique métier participants.
* Définition de la règle métier :
  * un participant ne peut être supprimé que s'il n'a aucune opération liée.
* Validation complète du flow update participants :
  * front ;
  * back ;
  * base de données.
* Analyse et résolution d'un blocage majeur de synchronisation du state local participants côté front.
* Identification des causes combinées :
  * mauvaise synchronisation state local / state global ;
  * resynchronisation automatique du formulaire écrasant les données ;
  * incohérences de typage ;
  * problème de transaction backend empêchant le retour correct des données créées.
* Préparation de la présentation de lundi.
* Identification d'un refactor backend à faire :
  * centraliser le check `isOwner` présent dans plusieurs services.
* Identification d'une amélioration UX :
  * notification lorsqu'un participant ne peut pas être supprimé car il possède des opérations.

### 08/06/2026 — Sprint 2 / Day 5

* Création d'un seed plus conséquent pour la démo.
* Résolution d'un problème mémoire lié à Prisma :
  * création d'un nouveau pool de connexions à chaque connexion ;
  * absence de libération des pools précédents.
* Préparation de la présentation orale du Sprint 2.
* Présentation orale du Sprint 2 devant l'équipe pédagogique et la classe.
* Correction d'un bug sur le bouton de suppression des participants :
  * bouton accessible alors que le mode Editer n'était pas activé.
* Correction de l'affichage du symbole euro en mode sombre.
* Ajout du message "Aucun participant pour le moment" lorsqu'un projet n'a pas de participant.

## Sprint 3 — Finalisation

### 09/06/2026 — Sprint 3 / Day 1

* Ajout d'un toast d'erreur lors d'une tentative d'enregistrement après suppression d'un participant.
* Ajout d'un message informatif lorsqu'aucun participant n'est associé au projet.
* Finalisation du CRUD Projet avec suppression côté backend et frontend.
* Ajout de la gestion des erreurs avec messages utilisateur.
* Redirection vers la liste des projets après suppression.
* Correction du bug d'affichage du type de projet entre les versions `_` et `/`.
* Mise en place de la page 404 avec gestion des thèmes clair et sombre.
* Mise en place de la page 403 pour les tentatives d'accès à un projet n'appartenant pas à l'utilisateur connecté.

### 10/06/2026 — Sprint 3 / Day 2

* Nettoyage des branches Git en local et sur le dépôt distant.
* Reprise de la configuration des tests d'intégration avec Docker et base de données dédiée aux tests.
* Mise en place du coverage.
* Ajout des scripts de coverage.
* Rédaction de la documentation coverage à destination de l'équipe.
* Création des tests unitaires pour la librairie d'erreurs :
  * message ;
  * code de statut ;
  * nom de classe ;
  * héritage `instanceof`.
* Création des tests d'intégration du middleware de gestion des erreurs.
* Debug long de la configuration des tests d'intégration.
* Identification de la cause des échecs :
  * doublon du fichier `vitest.integration.config.ts`.
* Résultat obtenu :
  * tests unitaires de la librairie d'erreurs opérationnels ;
  * tests d'intégration de l'error handler en place ;
  * infrastructure Docker de tests fonctionnelle ;
  * coverage fonctionnel.

### 11/06/2026 — Sprint 3 / Day 3

* Modification de l'illustration de la page 403.
* Création d'une page dédiée aux erreurs 500.
* Mise en place d'une redirection vers la page 500 lors d'erreurs serveur au chargement d'un projet.
* Mise en place d'une gestion centralisée des erreurs API dans `services/api.ts` :
  * `handleResponse` ;
  * `handleDeleteResponse`.
* Gestion des erreurs 401.
* Gestion des erreurs 429 avec toast global.
* Gestion des erreurs 500 avec toast global.
* Gestion homogène des erreurs réseau.
* Création d'un dossier dédié aux validations frontend.
* Séparation entre :
  * validations UI légères côté frontend ;
  * validations métier et sécurité côté backend avec Zod.
* Mise en place des premiers retours utilisateurs sous les champs de formulaire.
* Recherche sur le comportement du coverage affiché à 100 % sur les routes alors que contrôleurs, services et middlewares n'étaient pas réellement comptabilisés.
* Amélioration de la configuration de couverture.
* Analyse du fonctionnement de V8 et des limites du coverage sur l'architecture de tests d'intégration.
* Ajout de tests unitaires et d'intégration pour :
  * `validateProjectUpdate` ;
  * `validateProjectParticipantsUpdate` ;
  * `projects.controller.ts` ;
  * `GET /api/projects/:id` ;
  * `PATCH /api/projects/:id` ;
  * `PATCH /api/projects/:id/participants` ;
  * `DELETE /api/projects/:id`.
* Harmonisation de la gestion des erreurs Zod dans les middlewares.
* Choix de laisser remonter les `ZodError` vers l'`errorHandler` en 422.
* Correction d'incohérences de codes HTTP dans la gestion d'erreurs.

### 12/06/2026 — Sprint 3 / Day 4

* Création de la version dark de l'image d'erreur 500.
* Remplacement des placeholders `Loading...` par des composants Loader sur les écrans de l'application.
* Analyse de régressions de tests unitaires après merge de la branche de Ludovic.
* Correction des tests unitaires impactés.
* Correction des tests d'intégration devenus incompatibles avec les nouveaux comportements applicatifs.
* Mise en place de la documentation Swagger sur :
  * `Get Project By Id` ;
  * `Participants`.
* Ajout d'une feature bonus d'onboarding :
  * création automatique d'un projet de démonstration à l'inscription ;
  * création de participants fictifs ;
  * création d'opérations d'exemple ;
  * création d'un budget de démonstration ;
  * création d'une alerte budget déjà déclenchée.
* Correction d'un bug dans le seed des alertes :
  * identifiants explicites provoquant une désynchronisation de séquence PostgreSQL ;
  * resynchronisation de la séquence à la fin du seed.
* Adaptation des tests à la nouvelle logique d'inscription :
  * ajout du mock `$transaction` ;
  * ajout des modèles Prisma nécessaires dans les tests unitaires du service d'authentification ;
  * mise à jour du contrôleur d'authentification ;
  * suppression de l'exposition du mot de passe dans les réponses API ;
  * ajout du seed des catégories dans les helpers de tests ;
  * adaptation des assertions d'intégration.
* Mise en place de la connexion automatique après inscription.
* Côté back-end :
  * génération d'un JWT dès la création du compte ;
  * retour du token dans la réponse du endpoint Register ;
  * centralisation de la suppression du mot de passe dans le service d'authentification.
* Côté front-end :
  * récupération du token lors de l'inscription ;
  * redirection automatique vers la page des projets.
* Résolution d'un conflit entre la branche du projet de démonstration et la branche d'authentification automatique.
* Déplacement de la logique de nettoyage des données utilisateur dans le service.

## Synthèse transversale

### Conception et architecture

* Lead Dev du projet.
* Contribution majeure aux choix d'architecture front/back.
* Rédaction ou consolidation des choix techniques et de la stack.
* Travail sur MCD, MLD, MPD et dictionnaire de données.
* Réflexion métier approfondie sur la répartition des dépenses et l'algorithme glouton.
* Participation aux arbitrages MVP / hors MVP.

### Backend

* Mise en place du socle sécurité :
  * gestion centralisée des erreurs ;
  * erreurs personnalisées ;
  * middleware 404 ;
  * validation env ;
  * `cors`, `helmet`, XSS sanitizer, rate limit.
* Développement des routes projet :
  * détail projet ;
  * modification ;
  * suppression ;
  * participants.
* Mise en place des validations Zod.
* Gestion de l'ownership et des erreurs 401 / 403 / 404 / 422 / 500.
* Gestion du budget projet.
* Suppression en cascade et contraintes Prisma.
* Corrections de seed, connexions Prisma et séquences PostgreSQL.
* Ajout de documentation Swagger.
* Mise en place de l'onboarding avec projet de démonstration.
* Mise en place de la connexion automatique après inscription.

### Frontend

* Feature RGPD.
* Hydratation de la page détail projet.
* Mise en place du `ProjectsProvider`.
* Gestion des pages protégées et redirections.
* Dynamisation du formulaire projet.
* Gestion du budget, du seuil d'alerte et des participants.
* Correction de nombreux problèmes de typage front/API.
* Gestion centralisée des erreurs API.
* Pages 403, 404 et 500.
* Toasts et messages utilisateurs.
* Harmonisation des loaders.
* Adaptations UI dark mode.

### Qualité, tests et documentation

* Mise en place et documentation du coverage.
* Tests unitaires de la librairie d'erreurs.
* Tests d'intégration de l'error handler.
* Tests projet :
  * validators ;
  * controller ;
  * routes GET/PATCH/DELETE ;
  * participants.
* Correction de régressions de tests après merge.
* Documentation README, RGPD, carnets de bord et guides d'équipe.
* Nettoyage de branches Git et gestion de conflits PR.

### Présentations et organisation

* Présentation du Sprint 1.
* Préparation et présentation du Sprint 2.
* Proposition d'organisation front/back par binômes.
* Proposition d'un rôle Git Master rattaché au Lead Dev.
* Participation active aux revues de PR, merges et arbitrages techniques.
