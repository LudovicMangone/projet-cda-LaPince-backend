# Évolutions potentielles

## Description
Fonctionnalités identifiées mais volontairement exclues du MVP initial.
Chaque évolution est priorisée par version et justifiée par rapport aux besoins utilisateurs.

---

## V2 — Collaboration & ouverture

### Invitation par QR code
Un utilisateur peut inviter un participant à rejoindre le projet via un QR code.
Le participant le scanne, crée un compte et prend automatiquement la place de son profil fictif dans le projet.

> Cas d'usage prioritaire : invitation en présentiel (voyage, soirée, road trip…).

### Invitation par mail
Complément au QR code pour les invitations à distance.
L'utilisateur saisit l'adresse email d'un participant, qui reçoit un lien pour créer son compte et rejoindre le projet.

> Nécessite un service d'envoi d'email (Nodemailer, Resend…).

### Notifications in-app temps réel
Les membres d'un projet sont notifiés en temps réel lors d'événements clés :
- Ajout ou modification d'une dépense par un autre membre
- Dépassement ou approche d'un seuil budgétaire

> Dans le MVP, les alertes sont uniquement générées par le back et consultables dans l'interface.
> Cette évolution apporte la dimension temps réel entre membres (WebSocket ou SSE).

### Conversion de devises
Intégration de dune API de conversion monétaires (ex: ExchangeRate-API)  pour permettre la saisie de dépenses dans différentes devises.
Les montants sont automatiquement convertis dans la devise de référence du projet.



### Page de gestion de compte
Une page dédiée permettant à l'utilisateur de gérer son profil :
- Modifier son nom et son adresse email
- Modifier son mot de passe
- Supprimer son compte


---

## V3 — Enrichissement des données

### Répartition en pourcentage
Possibilité de répartir une dépense entre participants selon un pourcentage individualisé
plutôt qu'un montant fixe.

> Cas d'usage : couple avec des revenus différents souhaitant une répartition proportionnelle
> (ex : 64% / 36%) plutôt qu'un partage à 50/50.
> Dans le MVP, ce cas est couvert de manière moins élégante via la saisie manuelle des montants.

### Sous-catégories
Ajout d'un niveau de catégorisation supplémentaire.
Exemple : Alimentation → Restaurant, Supermarché, Boulangerie…

> L'ajout de cette feature nécessitera une évolution du modèle de données.

### Pièce jointe sur une dépense
Possibilité d'associer une pièce jointe optionnelle à une dépense (photo d'un reçu, facture…).

> Implique un chantier technique dédié : gestion de l'upload et du stockage de fichiers

### Export par projet
Possibilité d'exporter les données d'un projet dans deux formats :
- **PDF** — bilan propre et partageable au groupe en fin de projet
- **CSV** — données brutes retraitables dans un tableur (Excel, comptabilité…)

---

## V4 — Vue globale & IA

### Page dépenses globales
Une page dédiée centralisant toutes les dépenses de l'utilisateur, tous projets confondus.
Filtrable par catégorie, par date et par participant.

> S'appuie sur la route `GET /api/dashboard` notée comme évolution potentielle dans les routes API.

### Export global
Export de l'ensemble des dépenses de l'utilisateur tous projets confondus, aux formats PDF et CSV.

### Statistiques & graphiques avancés
Tableaux de bord enrichis avec visualisations graphiques :
- Répartition des dépenses par catégorie
- Évolution des dépenses dans le temps
- Comparaison entre projets

### Détection automatique du montant sur facture
Upload d'une photo de facture ou de reçu avec détection automatique du montant global
par reconnaissance optique de caractères (OCR).
Le montant détecté est pré-rempli dans le formulaire de saisie de la dépense.

### Catégorisation automatique par IA
Suggestion automatique de la catégorie lors de la saisie d'une dépense, basée sur le libellé.
Exemple : "Dîner Time Out Market" → Restauration.

> Les features OCR et catégorisation IA forment un tournant "automatisation" cohérent —
> même chantier, même version.
