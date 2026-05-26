# MVP — Minimum Viable Product

## Définition

Le MVP est la version la plus simple de **LaPince** permettant de valider notre idée auprès des premiers utilisateurs avec un minimum d'efforts. L'objectif n'est pas de livrer un produit fini, mais de **tester nos hypothèses**, recueillir du feedback réel et orienter les développements futurs.

LaPince simplifie le partage des coûts au sein d'un groupe en y intégrant une gestion budgétaire par catégories, pour aller au-delà du simple suivi de dépenses.

---

## Hypothèses

| Hypothèse | Comment on la valide |
|---|---|
| Les utilisateurs ont besoin d'un outil simple pour suivre les dépenses d'un groupe | Utilisation effective de la création de projet et d'opérations |
| La répartition automatique des coûts est suffisante dans un premier temps | Taux d'utilisation de la répartition manuelle vs automatique |
| Le budget optionnel par catégorie apporte de la valeur | Pourcentage d'utilisateurs qui activent cette fonctionnalité |

---

## Périmètre fonctionnel

Seules les fonctionnalités **indispensables** au parcours utilisateur
principal sont incluses.

### ✅ Inclus

- **Authentification** — inscription, connexion, déconnexion
- **Gestion des projets** — création, modification, archivage
- **Gestion des dépenses** — ajout, modification, suppression, consultation (CRUD)
- **Catégorisation** — association d'une dépense à une catégorie
- **Budget & alertes** — budget optionnel par catégorie, alerte réglable par projet
- **Répartition** — calcul automatique proportionnel + vue balance (qui doit quoi à qui)

---

## Definition of Done

Le MVP est livrable lorsque le parcours suivant fonctionne de bout en bout :

1. Un utilisateur s'inscrit et se connecte
2. Il crée un projet et y ajoute des participants
3. Il enregistre des dépenses avec catégorie, payeur et répartition
4. Il consulte la balance et sait exactement qui doit quoi à qui
5. Une alerte s'affiche si le seuil d'alerte défini est atteint dans un projet