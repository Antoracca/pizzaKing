# 🚀 Guide d'Installation - Pizza King

## ✅ Ce qui a été créé

Le projet Pizza King est maintenant complètement structuré avec :

- ✅ **Documentation complète** (8 fichiers MD)
- ✅ **Configuration monorepo** (pnpm workspace)
- ✅ **Package shared** (types, constants, utils)
- ✅ **Package firebase-config** (configuration Firebase)
- ✅ **Application Web** (Next.js 14)
- ✅ **Application Mobile** (React Native + Expo)
- ✅ **Backend** (Firebase Cloud Functions)

**Total : ~70 fichiers créés** 🎉

---

## 📦 Installation

### 1. Installer pnpm globalement

```bash
npm install -g pnpm
```

### 2. Installer toutes les dépendances

```bash
# Depuis la racine du projet
pnpm install
```

Cette commande va installer les dépendances pour :
- Le projet racine
- `packages/shared`
- `packages/firebase-config`
- `apps/web`
- `apps/mobile`
- `functions`

⏱️ **Temps estimé : 2-5 minutes**

---

## 🔥 Configuration Firebase

### 1. Créer le projet Firebase

Suivre le guide complet : [docs/FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)

Résumé :
1. Aller sur https://console.firebase.google.com
2. Créer un nouveau projet "Pizza King"
3. Activer les services :
   - Authentication (Email, Phone, Google)
   - Firestore Database
   - Storage
   - Cloud Functions (plan Blaze requis)
   - Cloud Messaging
   - Hosting

### 2. Configurer les variables d'environnement

#### Web
```bash
cp apps/web/.env.example apps/web/.env.local
# Éditer apps/web/.env.local avec vos clés Firebase
```

#### Mobile
```bash
cp apps/mobile/.env.example apps/mobile/.env
# Éditer apps/mobile/.env avec vos clés Firebase
```

#### Functions
```bash
cp functions/.env.example functions/.env
# Éditer functions/.env avec vos clés API
```

### 3. Se connecter à Firebase CLI

```bash
firebase login
firebase use --add
# Sélectionner le projet créé
```

### 4. Déployer les règles de sécurité

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

---

## 🚀 Lancer les applications

### Application Web (Next.js)

```bash
# Terminal 1 : Lancer le serveur de développement
pnpm dev:web
```

Ouvrir http://localhost:3000

### Application Mobile (React Native)

```bash
# Terminal 2 : Lancer Expo
pnpm dev:mobile
```

Scanner le QR code avec l'app **Expo Go** :
- iOS : Installer Expo Go depuis l'App Store
- Android : Installer Expo Go depuis le Play Store

### Firebase Émulateurs

```bash
# Terminal 3 : Lancer les émulateurs Firebase
pnpm emulators
```

Ouvrir http://localhost:4000 pour l'interface des émulateurs

### Firebase Functions (optionnel)

```bash
# Terminal 4 : Compiler les functions en mode watch
cd functions
pnpm dev
```

---

## 🧪 Vérifier que tout fonctionne

### Checklist

- [ ] `pnpm install` terminé sans erreur
- [ ] Projet Firebase créé et configuré
- [ ] Variables d'environnement définies
- [ ] Firebase CLI connecté
- [ ] Règles de sécurité déployées
- [ ] Application web démarre sur localhost:3000
- [ ] Application mobile démarre avec Expo
- [ ] Émulateurs Firebase accessibles sur localhost:4000

---

## 📁 Structure du projet

```
pizza-king/
├── apps/
│   ├── web/               # Next.js 14 (✅ créé)
│   └── mobile/            # React Native Expo (✅ créé)
│
├── functions/             # Firebase Cloud Functions (✅ créé)
│
├── packages/
│   ├── shared/            # Types, constants, utils (✅ créé)
│   └── firebase-config/   # Firebase configuration (✅ créé)
│
├── docs/                  # Documentation
│   └── FIREBASE_SETUP.md  # Guide Firebase (✅ créé)
│
├── context du projet/     # Cahier des charges
├── firebase.json          # Config Firebase (✅ créé)
├── firestore.rules        # Règles Firestore (✅ créé)
├── storage.rules          # Règles Storage (✅ créé)
├── package.json           # Root package (✅ créé)
└── pnpm-workspace.yaml    # Workspace config (✅ créé)
```

---

## 🛠️ Commandes principales

```bash
# Installation
pnpm install                    # Installer toutes les dépendances

# Développement
pnpm dev                        # Lancer tous les projets en parallèle
pnpm dev:web                    # Lancer uniquement le web
pnpm dev:mobile                 # Lancer uniquement le mobile
pnpm emulators                  # Lancer les émulateurs Firebase

# Build
pnpm build                      # Build tous les projets
pnpm build:web                  # Build web
pnpm build:mobile               # Build mobile

# Quality
pnpm lint                       # Linter
pnpm format                     # Formatter avec Prettier
pnpm type-check                 # Vérifier les types TypeScript

# Déploiement
pnpm deploy:web                 # Déployer le web
pnpm deploy:functions           # Déployer les functions
```

---

## 🔧 Configuration IDE (VSCode recommandé)

### Extensions recommandées

1. **ESLint** - Linting JavaScript/TypeScript
2. **Prettier** - Code formatter
3. **Tailwind CSS IntelliSense** - Autocomplete Tailwind
4. **Firebase** - Firebase tools
5. **React Native Tools** - React Native support

### Settings VSCode (`.vscode/settings.json`)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## 🐛 Dépannage

### Erreur : "pnpm command not found"

➡️ Installer pnpm globalement :
```bash
npm install -g pnpm
```

### Erreur : "Firebase not configured"

➡️ Vérifier que les variables d'environnement sont définies dans `.env.local` (web) et `.env` (mobile)

### Erreur : "Cannot find module @pizza-king/shared"

➡️ Réinstaller les dépendances :
```bash
pnpm install
```

### L'app mobile ne se lance pas

➡️ Vérifier qu'Expo Go est installé sur votre téléphone
➡️ Vérifier que vous êtes sur le même réseau WiFi

### Les émulateurs ne démarrent pas

➡️ Vérifier que les ports ne sont pas déjà utilisés : 4000, 5000, 5001, 8080, 9099, 9199

---

## 📚 Documentation

- [README.md](./README.md) - Documentation principale
- [ROADMAP.md](./ROADMAP.md) - Planning sur 7 semaines
- [SETUP.md](./SETUP.md) - Guide de setup détaillé
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Schéma base de données
- [TECH_STACK.md](./TECH_STACK.md) - Stack technique
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Structure du projet
- [docs/FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md) - Configuration Firebase

---

## 🎯 Prochaines étapes

Une fois l'installation terminée :

1. ✅ **Configurer Firebase** (voir docs/FIREBASE_SETUP.md)
2. ✅ **Créer les premières collections Firestore** (Phase 4)
3. ✅ **Développer l'authentification** (Phase 5)
4. ✅ **Créer les Cloud Functions** (Phase 6)
5. ✅ **Développer le frontend** (Phases 7 & 8)

Voir [ROADMAP.md](./ROADMAP.md) pour le planning complet.

---

## ✨ Features du projet

### Fonctionnalités principales

#### Clients
- 🔐 Inscription/Connexion (Email, Téléphone, Google)
- 🍕 Parcourir le menu de pizzas
- 🎨 Personnaliser les pizzas (taille, ingrédients, pâte)
- 🛒 Panier et commande
- 💳 Paiement en ligne (Stripe, PayPal, Mobile Money) ou cash
- 🗺️ Suivi de livraison en temps réel
- 🔔 Notifications (Push, SMS, WhatsApp)
- 🎁 Programme de fidélité (points, récompenses)
- 📜 Historique des commandes
- 📍 Gestion des adresses de livraison

#### Administrateurs
- 📊 Dashboard avec statistiques
- 📦 Gestion des commandes en temps réel
- 🍕 Gestion du menu (CRUD pizzas)
- 👥 Gestion des utilisateurs
- 🚚 Gestion des livreurs
- 🎫 Gestion des promotions et codes promo
- 📈 Rapports et analytics
- ⚙️ Configuration système

#### Livreurs
- 📱 App dédiée (future feature)
- 📍 Liste des livraisons à effectuer
- 🗺️ Navigation GPS
- ✅ Confirmation de livraison

---

## 💪 Bon développement !

Le projet est maintenant prêt pour le développement ! 🚀

**Questions ?** Consultez la documentation ou créez une issue sur GitHub.

---

**Version : 1.0.0**
**Dernière mise à jour : 2025-10-07**
