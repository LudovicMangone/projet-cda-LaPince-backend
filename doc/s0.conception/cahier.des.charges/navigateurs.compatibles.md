# Les navigateurs compatibles

## Tech Stack

L'application La Pince est une SPA web moderne développée avec :

- **React 19**
- **TypeScript 5**
- **Vite 8**
- **Tailwind CSS 4**

---

## Prérequis navigateur

Le projet cible les navigateurs modernes supportant nativement :

- ES Modules
- CSS modernes (Custom Properties, nesting)
- Flexbox / Grid
- `fetch` API
- `localStorage`
- Les APIs JavaScript récentes utilisées par React 19 et Vite 8

---

## Navigateurs compatibles

| Navigateur | Version minimale supportée | Notes |
| -- | -- | -- |
| Google Chrome | 109+ | Support complet recommandé |
| Mozilla Firefox | 115 ESR | Support complet |
| Safari | 16+ | Compatible macOS et iOS |
| Microsoft Edge | 109+ | Support complet |
| Opera | 95+ | Compatible via moteur Chromium |
| Safari Mobile | iOS 16+ | Compatible iPhone / iPad |
| Chrome for Android | Android 10+ | Compatible mobile |

---

## Navigateurs non supportés

Les navigateurs et versions suivants ne sont pas officiellement supportés :

- Internet Explorer (toutes versions)
- Safari < 16
- Chromium < 109
- Tout navigateur sans support ES Modules

---

## Configuration `browserslist` — `package.json`

Cette configuration est intégrée dans le `package.json` du repository front afin de :

- Contrôler précisément les navigateurs supportés
- Gérer la compatibilité CSS et JavaScript à la compilation
- Documenter les choix techniques du projet
- Éviter des comportements implicites liés aux defaults des outils

```json
"browserslist": {
  "production": [
    ">0.5%",
    "last 2 versions",
    "not dead",
    "not op_mini all"
  ],
  "development": [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version"
  ]
}
```