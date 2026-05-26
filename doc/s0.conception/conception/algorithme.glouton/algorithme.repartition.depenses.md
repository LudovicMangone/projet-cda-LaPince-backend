# 💸 Algorithme de répartition des dépenses — La Pince

> Document de réflexion sur la modélisation de la logique de calcul des balances et remboursements entre participants.
> Basé sur les exemples concrets du fichier [Excel draft de travail](https://docs.google.com/spreadsheets/d/1cbl3NBqQqBIx4CxtSs9p_Gtwi8PBxlywteaH2C5_1hg/edit?usp=sharing)

---

## 📐 Principe général

Le calcul se déroule en **deux phases distinctes** :

1. **Phase mathématique** — calcul des balances nettes de chaque participant
2. **Phase algorithmique** — détermination de qui rembourse qui, avec le minimum de transactions possible

La phase 2 repose sur un **algorithme glouton** (*greedy algorithm*) : à chaque itération, on règle la dette la plus simple possible (le plus petit débiteur rembourse le plus grand créditeur), jusqu'à ce que toutes les balances soient à zéro.

---

## 🗃️ Tables concernées

```
operation           → montant total, payeur (payer_participant_id)
operation_participant → répartition du montant entre participants (repartition_amount)
participant         → personnes impliquées dans le projet
project             → périmètre du calcul (les balances sont par projet)
```

---

## 📊 Exemple concret — Voyage Milan

### Données de départ

**Projet :** Voyage Milan — Week-end entre amis

| id | Participant | app_user_id |
|---|---|---|
| 1 | Steve | 1 (compte lié) |
| 2 | Ludo | null (invité) |
| 3 | Jérémy | null (invité) |

**Opérations :**

| id | Nom | Montant | Payeur |
|---|---|---|---|
| 1 | Restaurant Milan | 120 € | Steve |
| 2 | Essence | 60 € | Ludo |
| 3 | Airbnb Milan | 300 € | Jérémy |
| 4 | Courses petit-déj | 45 € | Steve |

**Répartition des opérations (`operation_participant`) :**

| Opération | Participant | Montant dû | Note |
|---|---|---|---|
| Resto 120 € | Steve | 40 € | |
| Resto 120 € | Ludo | 40 € | |
| Resto 120 € | Jérémy | 40 € | |
| Essence 60 € | Steve | 30 € | |
| Essence 60 € | Ludo | 30 € | |
| Airbnb 300 € | Steve | 150 € | Répartition non équitable — chambre différente |
| Airbnb 300 € | Ludo | 50 € | |
| Airbnb 300 € | Jérémy | 100 € | |
| Courses 45 € | Ludo | 20 € | Steve a payé mais ne consomme pas ces courses |
| Courses 45 € | Jérémy | 25 € | |

> ℹ️ **Remarque importante** : un participant peut payer une opération sans y figurer dans `operation_participant` (ex : Steve paie les courses mais ne les consomme pas). Le `payer_participant_id` et les lignes de répartition sont indépendants.

---

## 🧮 Phase 1 — Calcul des balances nettes

### Formule

```
balance(participant) = somme de ce qu'il a payé - somme de ce qu'il doit
```

Plus précisément :

```
balance(p) = SOMME DE operation.amount WHERE payer_participant_id = p
           MOINS SOMME DE operation_participant.repartition_amount WHERE participant_id = p
```

- **Balance négative** → le participant doit de l'argent (débiteur)
- **Balance positive** → le participant doit recevoir de l'argent (créditeur)
- **Balance = 0** → le participant est quitte

### Calcul pour le Voyage Milan

| Participant | A payé | Doit | Balance |
|---|---|---|---|
| Steve | 120 + 45 = **165 €** | 40 + 30 + 150 = **220 €** | **-55 €** |
| Ludo | 60 € | 40 + 30 + 50 + 20 = **140 €** | **-80 €** |
| Jérémy | 300 € | 40 + 100 + 25 = **165 €** | **+135 €** |

> ✅ Vérification : la somme des balances doit toujours être égale à 0.
> `-55 + (-80) + 135 = 0` ✅

---

## 🤖 Phase 2 — Algorithme glouton de remboursement

### Principe

L'objectif est de **remettre toutes les balances à zéro** avec le **minimum de transactions**.

À chaque étape :
1. Trier les participants par balance (du plus créditeur au plus débiteur)
2. Prendre le plus grand créditeur et le plus grand débiteur
3. Le débiteur rembourse le créditeur à hauteur du minimum des deux valeurs absolues
4. Mettre à jour les balances
5. Répéter jusqu'à ce que toutes les balances soient à zéro


---

### Déroulé pas à pas — Voyage Milan (3 participants)

**État initial :**
```
Jérémy : +135
Steve  :  -55
Ludo   :  -80
```

**Itération 1 :**
```
Créditeur le plus élevé  → Jérémy (+135)
Débiteur le moins endetté → Steve (-55)
Montant = MIN(135, 55) = 55

→ Steve vire 55 € à Jérémy

Jérémy : +80   (135 - 55)
Steve  :   0   ✅ quitte
Ludo   :  -80
```

**Itération 2 :**
```
Créditeur le plus élevé → Jérémy (+80)
Débiteur restant        → Ludo (-80)
Montant = MIN(80, 80) = 80

→ Ludo vire 80 € à Jérémy

Jérémy :  0   ✅ quitte
Ludo   :  0   ✅ quitte
```

**Résultat final : 2 transactions pour 3 participants** ✅


---

### Déroulé pas à pas — Exemple 4 participants (test avec montants aléatoires)

**État initial :**
```
Jérémy : +137
Aurore :  +57
Steve  :  -39
Ludo   : -155
```

**Itération 1 :**
```
Créditeur → Jérémy (+137)
Débiteur  → Steve (-39)   ← moins endetté
Montant = MIN(137, 39) = 39

→ Steve vire 39 € à Jérémy

Jérémy : +98
Aurore :  +57
Steve  :    0  ✅ quitte
Ludo   : -155
```

**Itération 2 :**
```
Créditeur → Jérémy (+98)   ← plus grand créditeur
Débiteur  → Ludo (-155)
Montant = MIN(98, 155) = 98

→ Ludo vire 98 € à Jérémy

Jérémy :   0  ✅ quitte
Aurore : +57
Ludo   : -57
```

**Itération 3 :**
```
Créditeur → Aurore (+57)
Débiteur  → Ludo (-57)
Montant = MIN(57, 57) = 57

→ Ludo vire 57 € à Aurore

Aurore :  0  ✅ quitte
Ludo   :  0  ✅ quitte
```

**Résultat final : 3 transactions pour 4 participants** ✅


---

### Pseudo-code

```
FONCTION calculerRemboursements(balances: Map<Participant, Montant>):

  transactions = []

  TANT QUE il existe au moins un débiteur ET un créditeur:

    // Étape 1 : trier par balance décroissante
    trier balances par montant décroissant

    // Étape 2 : identifier les deux cas extrêmes
    crediteur = participant avec la balance la plus positive
    debiteur  = participant avec la balance la plus négative

    // Étape 3 : calculer le montant du remboursement
    montant = MIN(balance[crediteur], ABS(balance[debiteur]))

    // Étape 4 : enregistrer la transaction
    transactions.ajouter({
      de: debiteur,
      vers: crediteur,
      montant: montant
    })

    // Étape 5 : mettre à jour les balances
    balance[crediteur] = balance[crediteur] - montant
    balance[debiteur]  = balance[debiteur]  + montant

    // Étape 6 : retirer les participants à zéro
    SI balance[crediteur] == 0: retirer crediteur de balances
    SI balance[debiteur]  == 0: retirer debiteur de balances

  RETOURNER transactions
```
---

## 📈 Complexité et limites

| Critère | Valeur |
|---|---|
| Type d'algorithme | Glouton (Greedy) |
| Complexité temporelle | O(n log n) — dominé par le tri à chaque itération |
| Nombre max de transactions | n - 1 (où n = nombre de participants) |
| Garantie d'optimalité | ✅ Minimum de transactions garanti |
| Cas limite : balance déjà à 0 | Le participant est ignoré d'emblée |
| Cas limite : montants négatifs | Non applicable — `repartition_amount > 0` en BDD |

---

## ⚠️ Points de vigilance pour l'implémentation

**Arrondi des montants** — travailler en centimes (entiers) plutôt qu'en décimaux flottants pour éviter les erreurs de précision. Multiplier par 100 avant les calculs, diviser à l'affichage. La BDD utilise déjà `DEC(10,2)` — côté JS, utiliser une lib comme `decimal.js` ou travailler en centimes.

**Somme des repartition_amount = montant total** — à valider côté back-end avant insertion. Si la somme des parts ne correspond pas au montant de l'opération, lever une erreur métier.

**Participant sans part** — si un participant paie mais n'est dans aucune ligne `operation_participant`, sa balance sera artificiellement créditrice. La validation doit s'assurer que le payeur figure bien dans la répartition s'il consomme.

**Projet archivé** — les calculs de balance restent lisibles mais aucune nouvelle opération ne doit modifier les balances d'un projet archivé.

