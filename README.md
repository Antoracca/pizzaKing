# 🍕 Pizza King - Dark Kitchen Digital Platform

**Plateforme digitale moderne pour pizzeria - Site web + Application mobile (iOS/Android)**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Description

Pizza King est une plateforme complète pour Dark Kitchen spécialisée dans la livraison et le retrait de pizzas. Le projet comprend :

- 🌐 **Site web** (Next.js 14) - Vitrine et commande en ligne
- 📱 **Application mobile** (React Native) - App iOS et Android
- ⚡ **Backend serverless** (Firebase) - Cloud Functions, Firestore, Auth
- 💳 **Paiements** - Stripe, PayPal, Mobile Money
- 🔔 **Notifications** - Push, SMS, WhatsApp, Email
- 🗺️ **Suivi livraison** - Géolocalisation temps réel
- 🎁 **Programme fidélité** - Points et récompenses

## 🎯 Objectifs

- ✅ Expérience utilisateur fluide et rapide
- ✅ Commande en moins de 3 minutes
- ✅ Suivi de livraison en temps réel
- ✅ Paiements sécurisés multiples
- ✅ Programme de fidélité digital
- ✅ Dashboard admin complet
- ✅ Performance optimale (web > 90/100)

## 🛠️ Stack Technique

### Frontend
- **Web** : Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Mobile** : React Native (Expo), TypeScript

### Backend
- **Firebase** : Firestore, Cloud Functions, Authentication, Storage
- **Runtime** : Node.js 20

### Outils
- **Package Manager** : pnpm (monorepo)
- **Linting** : ESLint + Prettier
- **CI/CD** : GitHub Actions
- **Testing** : Vitest, Jest, Playwright

## 📦 Structure du Projet

```
pizza-king/
├── apps/
│   ├── web/              # Application Next.js
│   └── mobile/           # Application React Native
├── functions/            # Firebase Cloud Functions
├── packages/
│   └── shared/           # Code partagé (types, utils, constants)
├── docs/                 # Documentation
└── scripts/              # Scripts utilitaires
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Firebase CLI
- Expo CLI (pour mobile)

### Installation

```bash
# Installer pnpm globalement
npm install -g pnpm

# Cloner le repository
git clone https://github.com/votre-org/pizza-king.git
cd pizza-king

# Installer les dépendances
pnpm install

# Installer Firebase CLI
npm install -g firebase-tools

# Installer Expo CLI
npm install -g @expo/cli
```

### Configuration

```bash
# Copier les fichiers d'environnement
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
cp functions/.env.example functions/.env

# Configurer Firebase
firebase login
firebase init
```

### Développement

```bash
# Lancer tous les projets en parallèle
pnpm dev

# Lancer uniquement le web
pnpm dev:web

# Lancer uniquement le mobile
pnpm dev:mobile

# Lancer les émulateurs Firebase
pnpm emulators
```

### URLs de développement

- Web : http://localhost:3000
- Mobile : Expo app (scan QR code)
- Firebase Emulator : http://localhost:4000

## 📚 Documentation

- [📖 Roadmap complète](./ROADMAP.md)
- [🛠️ Stack technique](./TECH_STACK.md)
- [🗄️ Schéma base de données](./DATABASE_SCHEMA.md)
- [📁 Structure du projet](./PROJECT_STRUCTURE.md)
- [🚀 Guide de déploiement](./docs/DEPLOYMENT.md)
- [🤝 Guide de contribution](./docs/CONTRIBUTING.md)

## 🏗️ Commandes Disponibles

### Développement
```bash
pnpm dev              # Lancer tous les projets
pnpm dev:web          # Web uniquement
pnpm dev:mobile       # Mobile uniquement
pnpm dev:functions    # Functions uniquement
```

### Build
```bash
pnpm build            # Build tous les projets
pnpm build:web        # Build web
pnpm build:mobile     # Build mobile
pnpm build:functions  # Build functions
```

### Qualité du code
```bash
pnpm lint             # Linter
pnpm lint:fix         # Fix automatique
pnpm format           # Formatter avec Prettier
pnpm test             # Lancer les tests
```

### Déploiement
```bash
pnpm deploy:web       # Déployer le web
pnpm deploy:functions # Déployer les functions
pnpm deploy:all       # Déployer tout
```

### Utilitaires
```bash
pnpm emulators        # Lancer émulateurs Firebase
pnpm seed             # Peupler la base de données
pnpm clean            # Nettoyer les dépendances
```

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests en mode watch
pnpm test:watch

# Coverage
pnpm test:coverage

# Tests E2E
pnpm test:e2e
```

## 🚢 Déploiement

### Production

```bash
# Build production
pnpm build

# Déployer
pnpm deploy:all
```

### Environnements
- **Development** : Local + Firebase Emulators
- **Staging** : Pré-production
- **Production** : Production finale

## 📊 Fonctionnalités

### Pour les clients
- ✅ Parcourir le menu de pizzas
- ✅ Personnaliser les pizzas (taille, ingrédients, pâte)
- ✅ Commander pour livraison ou retrait
- ✅ Payer en ligne (carte, PayPal, Mobile Money) ou en cash
- ✅ Suivre la livraison en temps réel sur carte
- ✅ Recevoir des notifications (push, SMS, WhatsApp)
- ✅ Accumuler des points de fidélité
- ✅ Consulter l'historique des commandes
- ✅ Gérer les adresses de livraison

### Pour les administrateurs
- ✅ Dashboard avec statistiques temps réel
- ✅ Gestion des commandes en direct
- ✅ Gestion du menu (CRUD pizzas)
- ✅ Gestion des utilisateurs et livreurs
- ✅ Gestion des promotions et codes promo
- ✅ Rapports et analytics
- ✅ Configuration système

### Pour les livreurs
- ✅ Liste des livraisons à effectuer
- ✅ Navigation GPS intégrée
- ✅ Mise à jour statut livraison
- ✅ Historique des livraisons

## 🔐 Sécurité

- ✅ Authentification Firebase (email, téléphone, Google)
- ✅ Règles de sécurité Firestore strictes
- ✅ Paiements sécurisés (PCI-DSS compliant)
- ✅ Chiffrement des données sensibles
- ✅ Rate limiting sur les APIs
- ✅ Protection CSRF/XSS
- ✅ RGPD compliant

## 📈 Performance

### Objectifs
- **Web** : Lighthouse score > 90/100
- **Mobile** : Launch time < 2s
- **API** : Response time < 200ms
- **Uptime** : > 99.9%

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE)

## 👥 Équipe

- **Product Owner** : [Nom]
- **Tech Lead** : [Nom]
- **Developers** : [Noms]
- **UI/UX Designer** : [Nom]

## 📞 Support

- Email : support@pizzaking.com
- Documentation : [docs.pizzaking.com]
- Issues : [GitHub Issues](https://github.com/votre-org/pizza-king/issues)

## 🗓️ Roadmap

Voir [ROADMAP.md](./ROADMAP.md) pour le planning détaillé.

### Phase 1 ✅ (Semaine 1)
- Architecture & Documentation

### Phase 2 🔄 (En cours)
- Setup environnement

### Phases suivantes
- Configuration Firebase
- Base de données
- Authentication
- Backend Core
- Frontend Web
- Application Mobile
- Paiements
- Notifications
- Programme fidélité
- Dashboard Admin
- Tests & QA
- Déploiement

## 📸 Screenshots

_À venir..._

## 🙏 Remerciements

- Firebase pour la plateforme backend
- Next.js team pour le framework
- Expo team pour React Native
- La communauté open source

---

**Made with ❤️ by Pizza King Team**

**Version 1.0.0** | Dernière mise à jour : 2025-10-07
