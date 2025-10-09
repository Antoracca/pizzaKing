# 📁 Pizza King - Structure du Projet

## 🌳 Arborescence Complète

```
pizza-king/
│
├── 📂 apps/
│   ├── 📂 web/                          # Application web Next.js
│   │   ├── 📂 app/                      # App Router Next.js 14
│   │   │   ├── 📂 (auth)/               # Routes authentification
│   │   │   │   ├── 📂 login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 signup/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── 📂 (main)/               # Routes principales
│   │   │   │   ├── 📂 menu/
│   │   │   │   │   ├── page.tsx         # Liste menu
│   │   │   │   │   └── 📂 [slug]/
│   │   │   │   │       └── page.tsx     # Détail pizza
│   │   │   │   ├── 📂 cart/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 checkout/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 orders/
│   │   │   │   │   ├── page.tsx         # Historique
│   │   │   │   │   └── 📂 [id]/
│   │   │   │   │       └── page.tsx     # Suivi commande
│   │   │   │   ├── 📂 profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 loyalty/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── 📂 admin/                # Dashboard admin
│   │   │   │   ├── 📂 dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 orders/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 menu/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 users/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 promotions/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📂 analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── 📂 api/                  # API Routes
│   │   │   │   ├── 📂 webhooks/
│   │   │   │   │   ├── stripe/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── paypal/
│   │   │   │   │       └── route.ts
│   │   │   │   └── 📂 auth/
│   │   │   │       └── [...nextauth]/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── page.tsx                 # Homepage
│   │   │   ├── layout.tsx               # Root layout
│   │   │   ├── globals.css              # Styles globaux
│   │   │   ├── error.tsx                # Error boundary
│   │   │   └── not-found.tsx            # 404
│   │   │
│   │   ├── 📂 components/               # Composants React
│   │   │   ├── 📂 ui/                   # Composants UI de base (shadcn)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── 📂 layout/               # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   │
│   │   │   ├── 📂 pizza/                # Composants pizza
│   │   │   │   ├── PizzaCard.tsx
│   │   │   │   ├── PizzaDetail.tsx
│   │   │   │   ├── PizzaCustomizer.tsx
│   │   │   │   └── PizzaFilters.tsx
│   │   │   │
│   │   │   ├── 📂 cart/                 # Composants panier
│   │   │   │   ├── CartItem.tsx
│   │   │   │   ├── CartSummary.tsx
│   │   │   │   └── CartDrawer.tsx
│   │   │   │
│   │   │   ├── 📂 order/                # Composants commande
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderTracking.tsx
│   │   │   │   ├── OrderTimeline.tsx
│   │   │   │   └── DeliveryMap.tsx
│   │   │   │
│   │   │   ├── 📂 forms/                # Formulaires
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   ├── AddressForm.tsx
│   │   │   │   └── CheckoutForm.tsx
│   │   │   │
│   │   │   └── 📂 admin/                # Composants admin
│   │   │       ├── OrdersTable.tsx
│   │   │       ├── StatsCard.tsx
│   │   │       ├── MenuEditor.tsx
│   │   │       └── ...
│   │   │
│   │   ├── 📂 lib/                      # Utilitaires & config
│   │   │   ├── firebase.ts              # Config Firebase
│   │   │   ├── firebase-admin.ts        # Admin SDK
│   │   │   ├── stripe.ts                # Config Stripe
│   │   │   ├── utils.ts                 # Fonctions utilitaires
│   │   │   ├── validations.ts           # Schémas Zod
│   │   │   └── constants.ts             # Constantes
│   │   │
│   │   ├── 📂 hooks/                    # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useOrders.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useGeolocation.ts
│   │   │
│   │   ├── 📂 store/                    # State management (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── cartStore.ts
│   │   │   ├── orderStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── 📂 services/                 # Services API
│   │   │   ├── pizzaService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── userService.ts
│   │   │   ├── paymentService.ts
│   │   │   └── notificationService.ts
│   │   │
│   │   ├── 📂 types/                    # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── pizza.ts
│   │   │   ├── order.ts
│   │   │   ├── user.ts
│   │   │   └── payment.ts
│   │   │
│   │   ├── 📂 public/                   # Assets statiques
│   │   │   ├── 📂 images/
│   │   │   ├── 📂 icons/
│   │   │   ├── favicon.ico
│   │   │   └── logo.svg
│   │   │
│   │   ├── 📂 styles/                   # Styles
│   │   │   └── globals.css
│   │   │
│   │   ├── .env.local                   # Variables d'environnement
│   │   ├── .eslintrc.json               # Config ESLint
│   │   ├── .prettierrc                  # Config Prettier
│   │   ├── next.config.js               # Config Next.js
│   │   ├── tailwind.config.ts           # Config Tailwind
│   │   ├── tsconfig.json                # Config TypeScript
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── 📂 mobile/                       # Application mobile React Native
│       ├── 📂 app/                      # Expo Router (file-based routing)
│       │   ├── 📂 (tabs)/               # Tabs navigation
│       │   │   ├── index.tsx            # Home
│       │   │   ├── menu.tsx             # Menu
│       │   │   ├── orders.tsx           # Commandes
│       │   │   ├── loyalty.tsx          # Fidélité
│       │   │   ├── profile.tsx          # Profil
│       │   │   └── _layout.tsx          # Tabs layout
│       │   │
│       │   ├── 📂 (auth)/               # Auth screens
│       │   │   ├── login.tsx
│       │   │   ├── signup.tsx
│       │   │   └── _layout.tsx
│       │   │
│       │   ├── 📂 (modals)/             # Modal screens
│       │   │   ├── pizza-detail.tsx
│       │   │   ├── cart.tsx
│       │   │   └── _layout.tsx
│       │   │
│       │   ├── 📂 order/
│       │   │   └── [id].tsx             # Order tracking
│       │   │
│       │   ├── _layout.tsx              # Root layout
│       │   └── index.tsx                # Splash/Welcome
│       │
│       ├── 📂 components/               # Composants React Native
│       │   ├── 📂 ui/                   # Composants UI
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.tsx
│       │   │   └── ...
│       │   │
│       │   ├── 📂 pizza/
│       │   │   ├── PizzaCard.tsx
│       │   │   ├── PizzaDetail.tsx
│       │   │   └── PizzaCustomizer.tsx
│       │   │
│       │   ├── 📂 cart/
│       │   │   ├── CartItem.tsx
│       │   │   └── CartSummary.tsx
│       │   │
│       │   ├── 📂 order/
│       │   │   ├── OrderCard.tsx
│       │   │   ├── OrderTracking.tsx
│       │   │   └── DeliveryMap.tsx
│       │   │
│       │   └── 📂 layout/
│       │       ├── Header.tsx
│       │       └── TabBar.tsx
│       │
│       ├── 📂 services/                 # Services
│       │   ├── firebase.ts
│       │   ├── pizzaService.ts
│       │   ├── orderService.ts
│       │   ├── paymentService.ts
│       │   └── notificationService.ts
│       │
│       ├── 📂 hooks/                    # Custom hooks
│       │   ├── useAuth.ts
│       │   ├── useCart.ts
│       │   ├── useOrders.ts
│       │   └── useLocation.ts
│       │
│       ├── 📂 store/                    # State management
│       │   ├── authStore.ts
│       │   ├── cartStore.ts
│       │   └── orderStore.ts
│       │
│       ├── 📂 utils/                    # Utilitaires
│       │   ├── constants.ts
│       │   ├── helpers.ts
│       │   └── validations.ts
│       │
│       ├── 📂 types/                    # Types TypeScript
│       │   └── index.ts
│       │
│       ├── 📂 assets/                   # Assets
│       │   ├── 📂 images/
│       │   ├── 📂 fonts/
│       │   └── 📂 icons/
│       │
│       ├── app.json                     # Expo config
│       ├── eas.json                     # EAS Build config
│       ├── .env                         # Variables environnement
│       ├── babel.config.js
│       ├── metro.config.js
│       ├── tsconfig.json
│       ├── package.json
│       └── README.md
│
├── 📂 functions/                        # Firebase Cloud Functions
│   ├── 📂 src/
│   │   ├── 📂 triggers/                 # Firestore triggers
│   │   │   ├── onOrderCreate.ts
│   │   │   ├── onOrderUpdate.ts
│   │   │   └── onUserCreate.ts
│   │   │
│   │   ├── 📂 https/                    # HTTP callable functions
│   │   │   ├── createOrder.ts
│   │   │   ├── updateOrderStatus.ts
│   │   │   ├── processPayment.ts
│   │   │   ├── sendNotification.ts
│   │   │   ├── calculateDeliveryFee.ts
│   │   │   └── applyPromoCode.ts
│   │   │
│   │   ├── 📂 scheduled/                # Scheduled functions
│   │   │   ├── dailyAnalytics.ts
│   │   │   ├── expirePromotions.ts
│   │   │   └── sendDailyReport.ts
│   │   │
│   │   ├── 📂 utils/                    # Utilitaires
│   │   │   ├── validators.ts
│   │   │   ├── emailTemplates.ts
│   │   │   ├── smsTemplates.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── 📂 services/                 # Services externes
│   │   │   ├── stripeService.ts
│   │   │   ├── twilioService.ts
│   │   │   ├── sendgridService.ts
│   │   │   └── mobileMoneyService.ts
│   │   │
│   │   ├── 📂 types/                    # Types
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                     # Export functions
│   │
│   ├── .env                             # Variables environnement
│   ├── .eslintrc.js
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── 📂 packages/                         # Packages partagés (monorepo)
│   ├── 📂 shared/                       # Code partagé
│   │   ├── 📂 src/
│   │   │   ├── 📂 types/                # Types communs
│   │   │   │   ├── user.ts
│   │   │   │   ├── pizza.ts
│   │   │   │   ├── order.ts
│   │   │   │   ├── payment.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📂 constants/            # Constantes
│   │   │   │   ├── orderStatus.ts
│   │   │   │   ├── pizzaSizes.ts
│   │   │   │   ├── roles.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📂 utils/                # Utilitaires
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── validators.ts
│   │   │   │   ├── calculators.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── 📂 firebase-config/              # Config Firebase partagée
│       ├── 📂 src/
│       │   ├── config.ts
│       │   ├── admin.ts
│       │   └── index.ts
│       │
│       ├── tsconfig.json
│       ├── package.json
│       └── README.md
│
├── 📂 docs/                             # Documentation
│   ├── API.md                           # Documentation API
│   ├── DEPLOYMENT.md                    # Guide déploiement
│   ├── CONTRIBUTING.md                  # Guide contribution
│   └── USER_GUIDE.md                    # Guide utilisateur
│
├── 📂 scripts/                          # Scripts utilitaires
│   ├── seed-data.ts                     # Seed Firestore
│   ├── migrate-data.ts                  # Migration données
│   ├── generate-types.ts                # Générer types depuis Firestore
│   └── cleanup.ts                       # Nettoyage données test
│
├── 📂 .github/                          # GitHub config
│   ├── 📂 workflows/                    # GitHub Actions
│   │   ├── web-deploy.yml               # Deploy web
│   │   ├── functions-deploy.yml         # Deploy functions
│   │   ├── mobile-build.yml             # Build mobile
│   │   └── tests.yml                    # Tests CI
│   │
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore                           # Git ignore
├── .prettierrc                          # Prettier config
├── .eslintrc.json                       # ESLint config global
├── pnpm-workspace.yaml                  # pnpm workspace config
├── package.json                         # Root package.json
├── turbo.json                           # Turbo config (optionnel)
├── firebase.json                        # Firebase config
├── firestore.rules                      # Firestore rules
├── firestore.indexes.json               # Firestore indexes
├── storage.rules                        # Storage rules
├── README.md                            # README principal
├── LICENSE                              # Licence
├── ROADMAP.md                           # Roadmap (créé)
├── TECH_STACK.md                        # Stack technique (créé)
├── DATABASE_SCHEMA.md                   # Schéma BDD (créé)
└── PROJECT_STRUCTURE.md                 # Ce fichier
```

---

## 📦 Configuration pnpm Workspace

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'functions'
```

### `package.json` (root)

```json
{
  "name": "pizza-king",
  "version": "1.0.0",
  "private": true,
  "description": "Pizza King - Dark Kitchen Digital Platform",
  "scripts": {
    "dev": "pnpm --parallel --filter \"./apps/**\" dev",
    "dev:web": "pnpm --filter web dev",
    "dev:mobile": "pnpm --filter mobile start",
    "dev:functions": "pnpm --filter functions dev",

    "build": "pnpm --filter \"./apps/**\" build",
    "build:web": "pnpm --filter web build",
    "build:mobile": "pnpm --filter mobile build",
    "build:functions": "pnpm --filter functions build",

    "lint": "pnpm --parallel --filter \"./apps/**\" lint",
    "lint:fix": "pnpm --parallel --filter \"./apps/**\" lint:fix",

    "test": "pnpm --parallel --filter \"./apps/**\" test",
    "test:watch": "pnpm --parallel --filter \"./apps/**\" test:watch",

    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",

    "deploy:web": "pnpm --filter web deploy",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:all": "pnpm deploy:web && pnpm deploy:functions",

    "emulators": "firebase emulators:start",
    "emulators:export": "firebase emulators:export ./emulator-data",

    "seed": "tsx scripts/seed-data.ts",
    "clean": "pnpm --parallel --filter \"./apps/**\" clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.7.0",
    "@typescript-eslint/parser": "^7.7.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.2.5",
    "prettier-plugin-tailwindcss": "^0.5.14",
    "tsx": "^4.7.2",
    "typescript": "^5.4.5"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

---

## 🔧 Fichiers de Configuration

### `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Next.js
apps/web/.next/
apps/web/out/
apps/web/build/

# Production
build/
dist/

# Expo
apps/mobile/.expo/
apps/mobile/dist/
apps/mobile/android/
apps/mobile/ios/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Misc
*.pem
.vercel
.turbo

# Functions
functions/lib/
functions/node_modules/

# Emulator data
emulator-data/
```

### `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `.eslintrc.json`

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "env": {
    "browser": true,
    "node": true,
    "es2022": true
  }
}
```

---

## 🚀 Commandes de développement

### Installation initiale

```bash
# Installer pnpm globalement
npm install -g pnpm

# Installer toutes les dépendances
pnpm install

# Installer Firebase CLI
npm install -g firebase-tools
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

### Build

```bash
# Build tous les projets
pnpm build

# Build web uniquement
pnpm build:web

# Build mobile uniquement
pnpm build:mobile
```

### Tests & Qualité

```bash
# Linter
pnpm lint
pnpm lint:fix

# Formatter
pnpm format
pnpm format:check

# Tests
pnpm test
pnpm test:watch
```

### Déploiement

```bash
# Deploy web
pnpm deploy:web

# Deploy functions
pnpm deploy:functions

# Deploy tout
pnpm deploy:all
```

---

## 📝 Notes importantes

### Organisation des imports

```typescript
// 1. Imports externes
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Imports internes absolus
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 3. Imports relatifs
import { PizzaCard } from './PizzaCard';

// 4. Types
import type { Pizza } from '@/types/pizza';

// 5. Styles (si applicable)
import styles from './Component.module.css';
```

### Conventions de nommage

- **Fichiers** : `PascalCase` pour composants, `camelCase` pour utils
- **Composants** : `PascalCase`
- **Hooks** : `use` prefix (`useAuth`, `useCart`)
- **Services** : `camelCase` avec suffix `Service` (`pizzaService`)
- **Types** : `PascalCase` (`interface User`, `type OrderStatus`)
- **Constants** : `UPPER_SNAKE_CASE` (`ORDER_STATUS`)

### Path aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/services/*": ["./services/*"]
    }
  }
}
```

---

**Version : 1.0.0**
**Dernière mise à jour : 2025-10-07**
