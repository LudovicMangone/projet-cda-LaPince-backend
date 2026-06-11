## 📊 Couverture de code (Coverage)

### C'est quoi ?
Le coverage mesure quelle proportion du code est exécutée pendant les tests.
Il permet d'identifier les fichiers et lignes qui ne sont pas encore couverts par des tests.

### Comment lancer le coverage ?
```bash
# Coverage des tests unitaires
npm run test:unit:coverage

# Coverage des tests d'intégration
npm run test:integration:coverage
```

### Comment lire le rapport ?
Le rapport s'affiche directement dans le terminal après l'exécution des tests.
Un rapport HTML plus détaillé est également généré dans le dossier `coverage/` — ouvrir `coverage/index.html` dans un navigateur pour voir ligne par ligne ce qui est couvert.

Les 4 colonnes du rapport :
- **% Stmts** — instructions exécutées
- **% Branch** — branches conditionnelles couvertes (`if/else`, ternaires)
- **% Funcs** — fonctions appelées
- **% Lines** — lignes exécutées

### Lecture de notre rapport actuel
Le coverage actuel reflète l'état initial du projet — seuls les tests d'authentification existent pour l'instant :
- `auth.controller.ts` et `auth.service.ts` sont couverts à ~100% ✅
- Les autres controllers et services sont à 0% — normal, les tests correspondants ne sont pas encore écrits
- `generated/prisma/` apparaît dans le rapport mais peut être ignoré — c'est du code généré automatiquement par Prisma, pas du code métier

### Objectif
Augmenter progressivement le coverage au fil de l'écriture des tests, en priorisant les **services** et **controllers** qui contiennent la logique métier.


## ⚙️ Configuration du coverage

### Principe
Le coverage mesure quelle proportion du code est exécutée pendant les tests.
Certains fichiers sont exclus du rapport car ils ne contiennent pas de logique métier testable — les inclure fausserait les statistiques en affichant un taux artificiellement élevé.

### Fichiers exclus des deux configs (intégration + unitaire)

- **`src/routers/**`** — déclarations de routes Express. Ces lignes sont exécutées au démarrage du serveur, pas lors des tests. Un 100% ici ne signifie pas que les routes sont testées.
- **`src/lib/prisma.ts`** — initialisation du client Prisma. S'exécute à l'import, aucune logique métier.
- **`src/lib/rateLimiter.ts`** — initialisation du rate limiter. Même raison.
- **`src/app.ts`**, **`src/server.ts`** — points d'entrée de l'application.
- **`src/config/**`** — configuration (CORS, env, Swagger).
- **`src/generated/**`** — code généré automatiquement par Prisma.
- **`src/test/**`** — fichiers de test eux-mêmes.

### Différence entre les deux configs

**Tests d'intégration** — `src/schemas/**` est exclu car les schémas Zod sont chargés au démarrage du serveur et apparaissent couverts sans avoir été réellement testés.

**Tests unitaires** — `src/schemas/**` est conservé car la validation Zod (formats d'email, longueur de mot de passe, champs obligatoires...) est de la logique métier qui mérite d'être testée unitairement.

### Ce qui compte vraiment dans le rapport
Les fichiers qui restent après exclusions représentent la vraie logique métier :
- `src/controllers/**`
- `src/services/**`
- `src/middlewares/**`
- `src/lib/errors.ts`
- `src/lib/greedy.ts`
- `src/lib/projectOwner.ts`

C'est sur ces fichiers que le taux de coverage doit progresser au fil de l'écriture des tests.