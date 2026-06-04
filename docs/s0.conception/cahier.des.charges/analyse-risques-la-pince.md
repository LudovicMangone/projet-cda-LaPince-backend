# Analyse des risques — La Pince

> Identifier les risques pouvant survenir pendant le développement et les solutions envisagées pour les limiter.

---

## Risques techniques

| Risque | Probabilité | Impact | Criticité |
|---|---|---|---|
| Erreur dans l'algorithme de calcul des remboursements | Moyenne | Élevé | 🔴 Critique |
| Failles de sécurité sur l'authentification JWT | Faible | Élevé | 🔴 Critique |
| Mauvaise modélisation de la base de données (migrations difficiles) | Moyenne | Élevé | 🔴 Critique |
| Absence de sanitization des données entrantes (formulaires) | Moyenne | Élevé | 🔴 Critique |
| Problèmes de performance sur les requêtes avec beaucoup de données | Faible | Moyen | 🟡 Modéré |
| Incompatibilité entre les versions des dépendances | Faible | Moyen | 🟡 Modéré |
| Gestion incorrecte des erreurs API côté front | Moyenne | Moyen | 🟡 Modéré |

---

## Risques organisationnels

| Risque | Probabilité | Impact | Criticité |
|---|---|---|---|
| Sous-estimation du temps de développement | Moyenne | Élevé | 🔴 Critique |
| Périmètre fonctionnel trop large pour le MVP | Moyenne | Élevé | 🔴 Critique |
| Manque de communication sur les choix techniques | Moyenne | Moyen | 🟡 Modéré |
| Dépendance à une seule personne sur une partie critique | Moyenne | Moyen | 🟡 Modéré |
| Mauvaise priorisation des tâches | Faible | Moyen | 🟢 Faible |

---

## Solutions envisagées pour chaque risque critique

### 🔴 Erreur dans l'algorithme de calcul des remboursements

L'algorithme de répartition des dépenses et de calcul des remboursements est le cœur métier de l'application. Une erreur fausserait tous les soldes et briserait la confiance des utilisateurs.

**Solutions :**

- Écrire des tests unitaires exhaustifs couvrant tous les cas de répartition (égale, inégale, participants partiels) → *évite des calculs faux qui passeraient inaperçus jusqu'en production*
- Valider l'algorithme avec des jeux de données réels avant intégration → *évite les cas limites non anticipés (montants décimaux, un seul participant, répartition à 0€)*
- Faire relire la logique par un pair avant de merger → *évite les erreurs de logique qu'un seul regard ne détecte pas*

---

### 🔴 Failles de sécurité sur l'authentification JWT

Un token mal géré (non expiré, non invalidé à la déconnexion, secret faible) peut exposer les données de tous les utilisateurs.

**Solutions :**

- Utiliser une clé secrète forte stockée en variable d'environnement → *évite qu'un attaquant puisse forger des tokens valides*
- Ne jamais stocker le token dans le localStorage — préférer un cookie `httpOnly` → *évite les attaques XSS qui pourraient voler le token*
- Tester les routes protégées avec des tokens invalides ou expirés → *évite des routes accessibles sans authentification valide*

---

### 🔴 Mauvaise modélisation de la base de données

Une erreur de modélisation détectée tard entraîne des migrations complexes, voire une réécriture partielle du schéma et des requêtes.

**Solutions :**

- Valider le MCD et le schéma Prisma avant de commencer le développement → *évite de découvrir trop tard qu'une relation est mal modélisée*
- Travailler en migrations successives et versionnées dès le début → *évite de perdre la traçabilité des changements de schéma*
- Ne pas hésiter à refactoriser tôt plutôt que de patcher tard → *évite une dette technique qui s'accumule et devient ingérable*

---

### 🔴 Sous-estimation du temps de développement

Le projet comporte des fonctionnalités complexes (répartition inégale, calcul des remboursements, alertes automatiques) qui peuvent prendre plus de temps que prévu.

**Solutions :**

- Définir un MVP strict avec uniquement les fonctionnalités essentielles → *évite de s'éparpiller et de ne rien livrer dans les délais*
- Découper chaque fonctionnalité en tâches estimées individuellement → *évite les estimations floues sur des blocs trop larges*
- Réévaluer les priorités à chaque fin de sprint → *évite de continuer dans une mauvaise direction sans s'en rendre compte*

---

### 🔴 Périmètre fonctionnel trop large pour le MVP

Vouloir tout faire dès la première version risque de ne rien finir correctement.

**Solutions :**

- Définir clairement ce qui est dans le MVP et ce qui est reporté en V2 → *évite de perdre de vue le périmètre initial, qui dilue les efforts sur trop de fonctionnalités à la fois*
- Toute nouvelle idée en cours de développement est ajoutée en backlog, pas au sprint en cours → *évite les interruptions qui désorganisent le travail en cours*
- Le MVP se concentre sur : auth, projets, participants, opérations, répartition, remboursements et gestion des alertes → *évite de livrer une application incomplète sur tous les fronts plutôt que complète sur l'essentiel*

---

### 🔴 Absence de sanitization des données entrantes (formulaires)

Des données non validées ou non nettoyées côté serveur peuvent exposer l'application à des injections SQL, des attaques XSS ou des données corrompues en base.

**Solutions :**

- Utiliser **Zod** pour valider et typer toutes les données entrantes côté back avant tout traitement → *évite que des données malformées ou malveillantes atteignent la base de données*
- Ne jamais faire confiance aux données envoyées par le client, même si le front les valide déjà → *évite les contournements via des appels API directs (Postman, scripts)*
- Échapper toutes les valeurs insérées en base via Prisma (ORM qui protège nativement contre les injections SQL) → *évite les injections SQL par construction*
- Valider les types, formats et longueurs maximales de chaque champ (montant positif, email valide, chaîne non vide…) → *évite la corruption silencieuse des données en base*

---

## Solutions envisagées pour chaque risque modéré

### 🟡 Problèmes de performance sur les requêtes avec beaucoup de données

Des requêtes non optimisées sur des groupes avec de nombreux participants ou opérations peuvent dégrader l'expérience utilisateur.

**Solutions :**

- Paginer les listes d'opérations côté back dès le départ → *évite de charger l'intégralité de l'historique en une seule requête*
- Ajouter des index sur les colonnes fréquemment filtrées (ex. `groupId`, `userId`) → *évite les full scans sur des tables qui grossissent*
- Mesurer les temps de réponse sur des jeux de données volumineuses avant la livraison → *évite de découvrir les problèmes de performance seulement en production*

---

### 🟡 Incompatibilité entre les versions des dépendances

Un conflit de versions entre librairies peut bloquer le build ou introduire des comportements inattendus.

**Solutions :**

- Versionner explicitement toutes les dépendances dans `package.json` (pas de `*` ni de `^` non maîtrisé) → *évite les mises à jour silencieuses qui cassent le build*
- Partager un fichier `package-lock.json` commun via le dépôt → *évite les divergences d'environnement entre membres de l'équipe*
- Tester le build en CI à chaque push → *évite qu'une incompatibilité passe inaperçue jusqu'à la livraison*

---

### 🟡 Gestion incorrecte des erreurs API côté front

Des erreurs non gérées (500, timeout, 401) peuvent laisser l'utilisateur face à une interface bloquée ou un comportement silencieux trompeur.

**Solutions :**

- Centraliser la gestion des erreurs HTTP dans un intercepteur Axios → *évite de dupliquer la logique de traitement des erreurs dans chaque appel*
- Afficher un message explicite à l'utilisateur pour chaque type d'erreur (réseau, session expirée, erreur serveur) → *évite que l'utilisateur reste bloqué sans comprendre ce qui s'est passé*
- Logger les erreurs inattendues côté front pour faciliter le débogage → *évite de devoir reproduire le problème à l'aveugle en cas de rapport de bug*

---

### 🟡 Manque de communication sur les choix techniques

Une décision technique prise isolément peut créer des incohérences dans l'architecture ou des incompréhensions entre membres de l'équipe.

**Solutions :**

- Documenter les choix techniques structurants dans un fichier dédié (ex. `DECISIONS.md`) → *évite que les raisons d'un choix soient perdues ou contestées plus tard*
- Soumettre tout choix impactant à une validation collective avant mise en œuvre → *évite les décisions unilatérales qui créent des frictions dans l'équipe*
- Utiliser les pull requests comme espace de discussion technique → *évite que les désaccords remontent uniquement lors des rétrospectives*

---

### 🟡 Dépendance à une seule personne sur une partie critique

Si un seul membre maîtrise une partie du code (ex. l'algorithme de répartition ou la configuration CI), son absence peut bloquer le projet.

**Solutions :**

- Pratiquer la revue de code systématique pour diffuser la connaissance → *évite qu'une partie du projet reste une boîte noire pour le reste de l'équipe*
- Documenter les parties complexes (algorithmes, configuration d'infra) dans le README ou un wiki → *évite de dépendre de la mémoire d'une seule personne*
- Alterner les responsabilités sur les tâches critiques d'un sprint à l'autre → *évite que les compétences restent silotées dans la durée*

---

## Solutions envisagées pour chaque risque faible

### 🟢 Mauvaise priorisation des tâches

Des tâches mal ordonnées peuvent bloquer d'autres membres ou mener à livrer des fonctionnalités secondaires avant les fonctionnalités essentielles.

**Solutions :**

- Prioriser le backlog en début de sprint selon la valeur métier et les dépendances techniques → *évite de travailler sur des tâches non bloquantes pendant que des tâches critiques attendent*
- Identifier explicitement les dépendances entre tâches lors du sprint planning → *évite les blocages en cours de sprint faute d'un prérequis non anticipé*
- Revoir la priorisation en daily si une tâche prend plus de temps que prévu → *évite de rigidifier le sprint face à des imprévus*
