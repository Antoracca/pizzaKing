# Scripts - Pizza King

Scripts utilitaires pour gérer la base de données Firestore.

## Installation

```bash
# Depuis la racine du projet
pnpm install
```

## Configuration

1. Créer un fichier `.env` depuis `.env.example`
2. Obtenir la clé de service Firebase Admin:
   - Aller sur [Firebase Console](https://console.firebase.google.com)
   - Sélectionner votre projet
   - Paramètres du projet > Comptes de service
   - Cliquer sur "Générer une nouvelle clé privée"
   - Télécharger le fichier JSON
   - Renommer en `serviceAccountKey.json` et placer dans le dossier `scripts/`
   - ⚠️ **NE JAMAIS COMMITER CE FICHIER SUR GIT**

3. Remplir les variables d'environnement dans `.env`:
```env
FIREBASE_PROJECT_ID=votre-project-id
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

## Scripts disponibles

### Seed (Peupler la base de données)

Ajoute des données de test dans Firestore.

```bash
pnpm seed
```

Ce script va créer:
- **6 pizzas** (Margherita, Reine, 4 Fromages, Pepperoni, Végétarienne, BBQ Chicken)
- **3 utilisateurs** de test:
  - Admin: `admin@pizzaking.com`
  - Client: `client@test.com`
  - Livreur: `deliverer@pizzaking.com`
- **3 promotions** (WELCOME10, SUMMER2025, LOYALTY20)

### Clear (Nettoyer la base de données)

Supprime toutes les données des collections Firestore.

```bash
pnpm clear
```

⚠️ **Attention**: Cette action est irréversible ! Utilisez avec précaution.

Collections nettoyées:
- pizzas
- users
- orders
- promotions
- addresses
- notifications
- loyaltyTransactions

## Utilisation typique

### Premier setup
```bash
# 1. Peupler la base avec des données de test
pnpm seed
```

### Reset complet
```bash
# 1. Nettoyer toutes les données
pnpm clear

# 2. Re-peupler avec des données fraîches
pnpm seed
```

## Structure des données

### Pizzas
- 6 pizzas variées (classiques, signature, végétarienne)
- Plusieurs tailles (small, medium, large)
- Types de pâte (fine, épaisse, farcie)
- Ingrédients par défaut et additionnels
- Images depuis Unsplash
- Informations nutritionnelles

### Utilisateurs
- **Admin** - Accès complet au dashboard
- **Client** - Utilisateur avec historique et points de fidélité
- **Livreur** - Avec véhicule et position GPS

### Promotions
- **WELCOME10** - 10% pour nouveaux clients
- **SUMMER2025** - 3000 FCFA de réduction
- **LOYALTY20** - 20% pour clients fidèles (>100 points)

## Notes importantes

### Sécurité
- Le fichier `serviceAccountKey.json` est dans `.gitignore`
- Ne jamais commiter les clés d'API
- Utiliser les Firebase Emulators en développement

### Firebase Emulators
Pour tester localement sans toucher à la production:

```bash
# Depuis la racine du projet
pnpm emulators

# Dans un autre terminal, seed les émulateurs
cd scripts
FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm seed
```

### Production
⚠️ Avant de seed en production:
1. Vérifier que `FIREBASE_PROJECT_ID` pointe vers le bon projet
2. S'assurer que les données de test sont appropriées
3. Considérer l'impact sur les utilisateurs existants

## Troubleshooting

### Erreur: "Firebase Admin not initialized"
- Vérifier que `.env` existe et contient `FIREBASE_PROJECT_ID`
- Vérifier que `serviceAccountKey.json` existe

### Erreur: "Permission denied"
- Vérifier les règles de sécurité Firestore
- En développement, utiliser les émulateurs
- Vérifier les permissions du service account

### Erreur: "Cannot find module"
- Exécuter `pnpm install` depuis la racine
- Vérifier que les packages workspace sont bien liés

## Développement

Pour ajouter de nouvelles données de test:

1. Modifier `seed-data.ts`
2. Ajouter vos données dans les arrays correspondants
3. Exécuter `pnpm seed`

Exemple:
```typescript
const pizzas: Omit<Pizza, 'id'>[] = [
  // ... pizzas existantes
  {
    name: 'Ma Nouvelle Pizza',
    slug: 'ma-nouvelle-pizza',
    // ... autres propriétés
  },
];
```

## Commandes utiles

```bash
# Vérifier le nombre de documents
firebase firestore:count pizzas
firebase firestore:count users

# Exporter les données
firebase firestore:export gs://your-bucket/backups

# Importer les données
firebase firestore:import gs://your-bucket/backups
```
