# RGPD - La Pince

## 1. Politique de confidentialité
[Cf le document correspondant](docs/s1.mise.en.place/rgpd/politique.confidentialite.md)
Elle explique :

* quelles données sont collectées,
* pourquoi,
* combien de temps elles sont conservées,
* qui y a accès,
* comment exercer ses droits,
* comment les données sont sécurisées.

Pour notre projet :

| Donnée                 | Pourquoi                   |
| ---------------------- | -------------------------- |
| email                  | authentification           |
| mot de passe hashé     | sécurité du compte         |
| nom/pseudo             | affichage dans les projets |
| opérations financières | fonctionnement métier      |
| alertes                | suivi budget               |


---

## 2. Minimisation des données


Ne stocker que ce qui est utile.

✅ pas de prénom/nom réel obligatoire
✅ pas d’adresse
✅ pas de téléphone
✅ pas de géolocalisation
✅ pas de carte bancaire

À garder comme principe :

> “Toute donnée non nécessaire ne doit pas être collectée.”

---

## 3. Sécurisation des données

### Déjà en place :

✅ Argon2
✅ Helmet
✅ CORS
✅ XSS sanitizer
✅ rate limiting
✅ validation Zod
✅ body limit
✅ JWT


---

## 4. Variables d’environnement sécurisées

Ne jamais commit :

* `.env`
* secrets JWT
* credentials DB

Déjà mis en place :

✅ `.env.example`
✅ `.gitignore`
✅ rotation facile des secrets

---

## 5. Droit à la suppression du compte

RGPD très important.

Nous avons déjà :

```txt
DELETE /api/users/:id
```

## Que devient la donnée ?

Exemples possibles :

### Option A — suppression totale

Supprimer :

* user,
* opérations,
* projets,
* participants liés.

### Option B — anonymisation (meilleure option)

Exemple :

```txt
Utilisateur supprimé
```

dans les anciennes opérations.


---

## 6. Durée de conservation

If faut définir une règle.

Exemple :

| Donnée             | Conservation              |
| ------------------ | ------------------------- |
| compte actif       | tant que le compte existe |
| compte supprimé    | anonymisation immédiate   |
| logs serveur       | 30 jours                  |
| tokens blacklistés | expiration JWT            |

Même si pas implémentez, le document RGPD doit le préciser.

---

## 7. Consentement et transparence

Si par la suite nous avons :

* analytics,
* tracking,
* cookies non essentiels,

→ bannière obligatoire.


Si JWT en localStorage/cookie uniquement pour auth :
pas besoin de bannière cookie marketing.

---

## 8. Gestion des accès


Chaque utilisateur doit uniquement voir :

* ses projets,
* ses opérations,
* ses alertes.

Donc :

✅ vérification ownership partout dans les services.

Exemple critique :

```ts
project.appUserId === req.user.id
```

Sinon :
faille IDOR classique.

C’est LE point sécurité/RGPD le plus important côté API.

---

## 9. Logs serveur

Attention à ne jamais logger :

❌ mot de passe
❌ JWT
❌ payload sensible complet
❌ stack trace en production exposée au client

Bonnes pratiques :

```ts
console.error(error)
```

côté serveur uniquement.

Mais réponse client :

```json
{
  "error": "Internal server error"
}
```

---

## 10. Documentation RGPD

- [politique-confidentialite.md](docs/s1.mise.en.place/rgpd/politique.confidentialite.md)
- [gestion-des-donnees.md](docs/s1.mise.en.place/rgpd/gestion.des.donnes.md)
- [securite.md](docs/s1.mise.en.place/rgpd/securite.md)
- [duree-conservation.md](docs/s1.mise.en.place/rgpd/duree.conservation.md)

---


---

# Ce qui est prioritaire pour notre projet

## Priorité haute

* ownership checks
* suppression/anonymisation utilisateur
* politique confidentialité
* secrets sécurisés
* sécurité API

---

## Priorité moyenne

* durée conservation
* docs RGPD
* logs propres

---

## Pas nécessaire à l'étape du MVP

* DPO
* registre CNIL complet
* DPIA
* chiffrement DB avancé
* consent manager complexe

