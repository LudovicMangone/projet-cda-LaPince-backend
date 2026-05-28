# Sécurité des données

## Introduction

La sécurité des données utilisateurs est prise en compte dès la conception du projet La Pince.

Des mesures techniques et organisationnelles sont mises en place afin de limiter :
- les accès non autorisés,
- les pertes de données,
- les injections malveillantes,
- les abus de l’API.

---

# Mesures de sécurité mises en place

## Authentification sécurisée

L’API utilise un système d’authentification par token JWT.

Les mots de passe sont hachés avec Argon2 avant stockage.

Aucun mot de passe n’est conservé en clair.

---

## Protection des requêtes HTTP

Plusieurs middlewares de sécurité sont utilisés :

### Helmet

Ajoute des headers HTTP de sécurité afin de limiter certaines attaques web :
- XSS,
- clickjacking,
- sniffing MIME,
- injection de contenu.

---

### CORS

Les accès cross-origin sont contrôlés afin de limiter les appels non autorisés à l’API.

---

### XSS Sanitizer

Les entrées utilisateur sont nettoyées afin de réduire les risques d’injection de scripts malveillants.

---

### Rate Limiting

Un système de limitation du nombre de requêtes est mis en place afin de limiter :
- les abus,
- le spam,
- certaines attaques automatisées.

---

### Limitation de taille des payloads

La taille maximale des requêtes HTTP est limitée afin de prévenir certaines attaques par surcharge.

---

# Gestion des erreurs

L’application utilise :
- un middleware global de gestion des erreurs,
- des erreurs HTTP personnalisées,
- des réponses serveur génériques en cas d’erreur interne.

Les détails techniques sensibles ne sont jamais exposés aux utilisateurs.

---

# Variables d’environnement

Les secrets applicatifs sont stockés dans des variables d’environnement :
- clés JWT,
- accès base de données,
- configuration serveur.

Ces informations ne doivent jamais être versionnées dans Git.

---

# Bonnes pratiques de développement

Le projet applique également :
- TypeScript pour réduire les erreurs runtime,
- Prisma ORM pour limiter les risques liés aux requêtes SQL,
- Husky et Biome pour améliorer la qualité du code,
- GitHub Actions pour automatiser les vérifications du projet.

---

# Limites

Malgré les mesures mises en place, aucun système informatique ne peut garantir une sécurité absolue.

En cas de faille détectée, des correctifs pourront être déployés afin de sécuriser l’application.