# 🛠️ Pizza King - Stack Technique Détaillée

## 📦 Gestionnaire de paquets

**pnpm** (choisi pour sa rapidité et efficacité)

### Pourquoi pnpm ?
- ✅ 3x plus rapide que npm
- ✅ Économie d'espace disque (symlinks)
- ✅ Workspace natif (monorepo)
- ✅ Sécurité renforcée (strict)
- ✅ Compatible avec npm/yarn

### Installation
```bash
npm install -g pnpm
```

---

## 🏗️ Architecture Monorepo

```
pizza-king/
├── apps/
│   ├── web/              # Next.js 14 (Site vitrine + commande)
│   ├── mobile/           # React Native (App iOS/Android)
│   └── admin/            # Next.js 14 (Dashboard admin - optionnel)
│
├── packages/
│   ├── shared/           # Code partagé (types, utils, constants)
│   ├── ui/               # Composants UI partagés
│   └── firebase/         # Configuration Firebase
│
├── functions/            # Firebase Cloud Functions
│
├── docs/                 # Documentation
│
└── scripts/              # Scripts utilitaires
```

---

## 🌐 Frontend Web (apps/web)

### Framework & Librairies principales

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0"
  }
}
```

### Stack complète

| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| **Framework** | Next.js | 14.2+ | App Router, SSR, SEO |
| **Langage** | TypeScript | 5.4+ | Type safety |
| **UI/Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **Composants** | Shadcn/ui | Latest | Composants accessibles |
| **Icons** | Lucide React | Latest | Icons modernes |
| **Forms** | React Hook Form | 7.51+ | Gestion formulaires |
| **Validation** | Zod | 3.22+ | Validation schémas |
| **State** | Zustand | 4.5+ | State management léger |
| **Firebase** | Firebase SDK | 10.11+ | Backend services |
| **Maps** | @vis.gl/react-google-maps | Latest | Google Maps React |
| **Paiements** | @stripe/stripe-js | Latest | Stripe integration |
| **Analytics** | Firebase Analytics | Latest | Tracking utilisateur |
| **Animations** | Framer Motion | 11+ | Animations fluides |

### Dev Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.0",
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 📱 Application Mobile (apps/mobile)

### Framework & Librairies principales

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react-native": "0.74.0",
    "typescript": "^5.4.0"
  }
}
```

### Stack complète

| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| **Framework** | React Native | 0.74+ | Cross-platform mobile |
| **Plateforme** | Expo | 51+ | Développement rapide |
| **Langage** | TypeScript | 5.4+ | Type safety |
| **Navigation** | Expo Router | 3+ | Navigation file-based |
| **UI Kit** | React Native Paper | 5+ | Material Design |
| **Icons** | @expo/vector-icons | Latest | Icons |
| **Forms** | React Hook Form | 7.51+ | Gestion formulaires |
| **State** | Zustand | 4.5+ | State management |
| **Firebase** | @react-native-firebase | 19+ | Services Firebase |
| **Maps** | react-native-maps | 1.14+ | Cartes natives |
| **Paiements** | @stripe/stripe-react-native | Latest | Paiements mobiles |
| **Notifications** | expo-notifications | Latest | Push notifications |
| **Location** | expo-location | Latest | Géolocalisation |
| **Camera** | expo-camera | Latest | QR code scanner |
| **Storage** | @react-native-async-storage | Latest | Storage local |
| **Animations** | react-native-reanimated | 3+ | Animations natives |

### Dev Dependencies

```json
{
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "^18.3.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  }
}
```

---

## ⚙️ Backend (functions/)

### Firebase Cloud Functions

```json
{
  "dependencies": {
    "firebase-admin": "^12.1.0",
    "firebase-functions": "^5.0.0",
    "typescript": "^5.4.0"
  }
}
```

### Stack complète

| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| **Runtime** | Node.js | 20 | Environnement |
| **Langage** | TypeScript | 5.4+ | Type safety |
| **Functions** | Firebase Functions | 5+ | Serverless backend |
| **Admin SDK** | firebase-admin | 12+ | Opérations admin |
| **Validation** | Zod | 3.22+ | Validation données |
| **Paiements** | stripe | Latest | API Stripe |
| **SMS** | twilio | Latest | Envoi SMS |
| **Email** | @sendgrid/mail | Latest | Emails transactionnels |
| **Scheduling** | firebase-functions/scheduler | Latest | Tâches planifiées |

---

## 🗄️ Base de Données

### Firebase Services

| Service | Usage | Configuration |
|---------|-------|--------------|
| **Firestore** | Base de données NoSQL | Mode natif, multi-région |
| **Authentication** | Gestion utilisateurs | Email, Phone, Google |
| **Storage** | Fichiers (images) | Règles sécurisées |
| **Hosting** | Hébergement web | CDN global |
| **Cloud Functions** | Backend serverless | Node.js 20 |
| **Cloud Messaging** | Push notifications | iOS + Android |
| **Analytics** | Tracking utilisateur | Événements custom |
| **Performance** | Monitoring perf | Temps de chargement |
| **Crashlytics** | Rapport crashes | Mobile uniquement |

---

## 📦 Packages Partagés

### packages/shared

```typescript
// Types communs
export interface User { ... }
export interface Pizza { ... }
export interface Order { ... }

// Utils
export const formatPrice = (price: number) => { ... }
export const calculateDeliveryTime = () => { ... }

// Constants
export const PIZZA_SIZES = ['S', 'M', 'L', 'XL']
export const ORDER_STATUS = { ... }
```

### packages/ui

```typescript
// Composants partagés (si possible entre web et mobile)
export { Button } from './Button'
export { Card } from './Card'
export { Input } from './Input'
```

### packages/firebase

```typescript
// Configuration Firebase
export const firebaseConfig = { ... }
export const initializeFirebase = () => { ... }
```

---

## 🔧 Outils de Développement

### Linting & Formatting

```json
{
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "@typescript-eslint/eslint-plugin": "^7.7.0",
    "@typescript-eslint/parser": "^7.7.0",
    "prettier": "^3.2.5",
    "prettier-plugin-tailwindcss": "^0.5.14"
  }
}
```

### Testing

| Outil | Usage |
|-------|-------|
| **Vitest** | Tests unitaires (web) |
| **Jest** | Tests unitaires (mobile) |
| **React Testing Library** | Tests composants |
| **Playwright** | Tests E2E (web) |
| **Detox** | Tests E2E (mobile - optionnel) |
| **Firebase Emulator** | Tests Firebase local |

### CI/CD

| Outil | Usage |
|-------|-------|
| **GitHub Actions** | Pipeline CI/CD |
| **Firebase Hosting** | Déploiement automatique web |
| **EAS Build** | Build mobile (Expo) |
| **Sentry** | Monitoring erreurs (optionnel) |

---

## 🔐 Sécurité

### Librairies de sécurité

```json
{
  "dependencies": {
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.2.0",
    "dotenv": "^16.4.0"
  }
}
```

### Règles Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles strictes par collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /orders/{orderId} {
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'deliverer'];
    }
  }
}
```

---

## 🌍 Internationalisation (Futur)

```json
{
  "dependencies": {
    "next-intl": "^3.11.0",
    "i18next": "^23.11.0",
    "react-i18next": "^14.1.0"
  }
}
```

Langues prévues : FR (défaut), EN, AR

---

## 📊 Analytics & Monitoring

| Service | Usage | Coût |
|---------|-------|------|
| **Firebase Analytics** | Événements utilisateur | Gratuit |
| **Google Analytics 4** | Analyse web avancée | Gratuit |
| **Firebase Performance** | Temps de chargement | Gratuit |
| **Sentry** | Monitoring erreurs | Gratuit (< 5k événements/mois) |
| **LogRocket** | Session replay (optionnel) | Payant |

---

## 💳 Intégrations Paiement

### APIs à intégrer

```json
{
  "dependencies": {
    "stripe": "^15.1.0",
    "@stripe/stripe-js": "^3.3.0",
    "@stripe/react-stripe-js": "^2.7.0",
    "@paypal/checkout-server-sdk": "^1.0.3"
  }
}
```

| Provider | Méthode | SDK |
|----------|---------|-----|
| **Stripe** | Carte bancaire | @stripe/stripe-js |
| **PayPal** | Compte PayPal | @paypal/checkout-server-sdk |
| **Mobile Money** | API locale | Fetch API custom |
| **Cash** | À la livraison | Gestion manuelle |

---

## 📱 Push Notifications

### Services

```json
{
  "dependencies": {
    "firebase-admin": "^12.1.0",
    "expo-notifications": "~0.28.0",
    "twilio": "^5.0.0"
  }
}
```

| Type | Service | Usage |
|------|---------|-------|
| **Push** | Firebase Cloud Messaging | Notifications app |
| **SMS** | Twilio | SMS transactionnels |
| **WhatsApp** | Twilio WhatsApp API | Messages WhatsApp |
| **Email** | SendGrid | Emails transactionnels |

---

## 🗺️ Cartographie

```json
{
  "dependencies": {
    "@vis.gl/react-google-maps": "^1.1.0",
    "react-native-maps": "^1.14.0",
    "@react-native-google-maps/google-maps": "^0.1.0"
  }
}
```

- Google Maps Platform (Web + Mobile)
- Geolocation API
- Directions API (calcul itinéraires)
- Distance Matrix API (estimation temps)

---

## 🔄 Versions recommandées

### Runtime
- Node.js : **20.x LTS**
- pnpm : **9.x**
- npm (CI) : **10.x**

### Navigateurs supportés
- Chrome : dernières 2 versions
- Firefox : dernières 2 versions
- Safari : dernières 2 versions
- Edge : dernières 2 versions

### Mobiles supportés
- iOS : **14.0+**
- Android : **8.0+ (API 26+)**

---

## 📦 Installation Complète

### Prérequis système

```bash
# Node.js 20.x
node -v  # v20.x.x

# pnpm
pnpm -v  # 9.x.x

# Git
git --version

# Firebase CLI
npm install -g firebase-tools

# Expo CLI (pour mobile)
npm install -g @expo/cli
```

### Variables d'environnement

```bash
# apps/web/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx

# apps/mobile/.env
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
# ... (identiques à web)

# functions/.env
STRIPE_SECRET_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
SENDGRID_API_KEY=xxx
```

---

## 🎯 Commandes pnpm

```json
{
  "scripts": {
    "dev": "pnpm --filter \"apps/**\" dev",
    "dev:web": "pnpm --filter web dev",
    "dev:mobile": "pnpm --filter mobile start",
    "build": "pnpm --filter \"apps/**\" build",
    "build:web": "pnpm --filter web build",
    "build:mobile": "pnpm --filter mobile build",
    "lint": "pnpm --filter \"apps/**\" lint",
    "test": "pnpm --filter \"apps/**\" test",
    "deploy:web": "pnpm --filter web deploy",
    "deploy:functions": "firebase deploy --only functions",
    "emulators": "firebase emulators:start"
  }
}
```

---

## 📈 Performance Targets

### Web
- Lighthouse Score : **> 90/100**
- First Contentful Paint : **< 1.5s**
- Time to Interactive : **< 3s**
- Core Web Vitals : **✅ Vert**

### Mobile
- App size : **< 50 MB**
- Launch time : **< 2s**
- Crash rate : **< 1%**
- Frame rate : **60 FPS**

### Backend
- Cloud Function cold start : **< 1s**
- API response time : **< 200ms**
- Firestore read/write : **< 100ms**

---

## 💰 Coûts estimés (infrastructure mensuelle)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Firebase (Blaze) | Pay-as-you-go | 50-150€ |
| Google Maps | Pay-as-you-go | 50-100€ |
| Twilio (SMS) | Pay-as-you-go | 50-100€ |
| SendGrid | Free (100 emails/jour) | 0€ |
| Stripe | 1.4% + 0.25€/transaction | Variable |
| Domaine | - | 15€/an |
| **Total** | - | **150-350€/mois** |

*Note : Coûts pour ~1000-2000 commandes/mois*

---

**Version : 1.0.0**
**Dernière mise à jour : 2025-10-07**
