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