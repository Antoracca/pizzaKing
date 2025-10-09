# 🚀 Quick Start Guide - Pizza King

**Lancer l'application web en 5 minutes**

---

## ⚡ Prérequis

- **Node.js** 20+ installé
- **pnpm** installé (`npm install -g pnpm`)
- **Git** (déjà configuré)

---

## 📦 Étape 1: Installer les dépendances

```bash
# Installer toutes les dépendances du monorepo
pnpm install
```

Cette commande installe les dépendances pour:
- Root workspace
- `apps/web` (Next.js)
- `apps/mobile` (React Native)
- `packages/shared`
- `packages/firebase-config`
- `functions` (Cloud Functions)

**Temps estimé:** 2-3 minutes

---

## 🌐 Étape 2: Lancer l'application Web

### Option A: Sans Firebase (Mock Data) - Le plus rapide ✅

```bash
# Depuis la racine du projet
pnpm dev:web
```

Ou depuis le dossier web:

```bash
cd apps/web
pnpm dev
```

**L'application sera disponible sur:** http://localhost:3000

### Option B: Avec Firebase (Données réelles)

Si vous voulez connecter Firebase:

1. **Créer un projet Firebase:**
   - Aller sur https://console.firebase.google.com
   - Créer un nouveau projet "pizza-king-dev"
   - Activer Firestore, Authentication, Storage

2. **Récupérer les clés Firebase:**
   - Dans Project Settings → General
   - Copier la configuration Web

3. **Créer `.env.local` dans `apps/web`:**

```bash
cd apps/web
```

Créer le fichier `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Lancer avec Firebase:**

```bash
pnpm dev
```

---

## 📱 Étape 3 (Optionnel): Lancer l'application Mobile

```bash
# Depuis la racine
pnpm dev:mobile

# Ou depuis apps/mobile
cd apps/mobile
pnpm start
```

Ensuite:
- Appuyez sur `a` pour Android
- Appuyez sur `i` pour iOS
- Scannez le QR code avec Expo Go

---

## 🔥 Étape 4 (Optionnel): Lancer les Firebase Emulators

Pour tester les Cloud Functions en local:

```bash
# Installer Firebase CLI si pas déjà fait
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Depuis la racine du projet
pnpm emulators
```

Emulators disponibles:
- **Firestore:** http://localhost:8080
- **Functions:** http://localhost:5001
- **Authentication:** http://localhost:9099

---

## 🧪 Tester l'application Web

### Pages disponibles:

1. **Home** - http://localhost:3000
   - Hero section
   - Featured pizzas
   - Stats
   - How it works

2. **Menu** - http://localhost:3000/menu
   - Filtres par catégorie
   - Recherche
   - Grid de pizzas
   - Modal détails pizza

3. **Compte** - http://localhost:3000/account
   - Dashboard client
   - Historique commandes
   - Stats

4. **Admin** - http://localhost:3000/admin
   - Dashboard admin
   - KPIs
   - Commandes récentes
   - Top pizzas

5. **Checkout** - http://localhost:3000/checkout
   - Multi-étapes (Livraison → Paiement → Confirmation)
   - 3 modes de paiement

6. **Login/Signup** - http://localhost:3000/login

### Features à tester:

- ✅ **Navigation** - Header, Footer, liens
- ✅ **Animations** - Framer Motion (hover, scroll)
- ✅ **Responsive** - Redimensionner la fenêtre
- ✅ **Dark mode** - Si implémenté
- ✅ **Panier** - Ajouter/retirer items
- ✅ **Filtres** - Menu par catégorie
- ✅ **Recherche** - Pizzas par nom

---

## 🐛 Dépannage

### Erreur: "Module not found"

```bash
# Nettoyer et réinstaller
pnpm clean
pnpm install
```

### Erreur: "Port 3000 already in use"

```bash
# Tuer le processus sur le port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Ou utiliser un autre port
PORT=3001 pnpm dev:web
```

### Erreur: "pnpm command not found"

```bash
npm install -g pnpm
```

### Erreur Firebase: "Firebase not initialized"

L'app peut fonctionner sans Firebase en mode mock data. Pour activer Firebase, suivez l'Étape 2 Option B.

---

## 📝 Scripts disponibles

```bash
# Web
pnpm dev:web          # Lancer web en dev
pnpm build:web        # Build web pour production
pnpm start:web        # Lancer web en production

# Mobile
pnpm dev:mobile       # Lancer mobile avec Expo
pnpm android          # Build Android
pnpm ios              # Build iOS

# Functions
pnpm emulators        # Lancer Firebase emulators
pnpm deploy:functions # Déployer functions

# Global
pnpm dev              # Lancer tous les apps en parallèle
pnpm build            # Build tous les apps
pnpm clean            # Nettoyer node_modules
pnpm lint             # Linter tous les projets
```

---

## 🎨 Personnalisation

### Changer la couleur principale:

`apps/web/app/globals.css`:
```css
:root {
  --primary: 24 100% 60%; /* Orange par défaut */
}
```

### Ajouter des pizzas:

Éditer `apps/web/app/menu/page.tsx` et ajouter dans le tableau `allPizzas`.

---

## 📊 État actuel du projet

**✅ Fonctionnel (Mode Mock Data):**
- Pages web complètes avec UI premium
- Navigation et routing
- Animations Framer Motion
- Responsive design
- Composants UI (Button, Card, Badge)

**⏳ Nécessite configuration:**
- Firebase (pour données réelles)
- Paiements (Stripe, PayPal, Mobile Money)
- Notifications
- GPS tracking

**🔜 À développer:**
- Connexion Firebase réelle
- Tests E2E
- Déploiement production

---

## 🎯 Prochaines étapes après le test

1. **Configurer Firebase** (si vous voulez des données réelles)
2. **Tester toutes les pages**
3. **Vérifier le responsive**
4. **Tester les animations**
5. **Reporter les bugs éventuels**
6. **Continuer avec Phase 10** (Notifications)

---

## 💡 Conseils

- **Ctrl+C** pour arrêter le serveur
- **Ctrl+Shift+R** pour forcer le refresh du navigateur
- **F12** pour ouvrir les DevTools
- Les changements sont automatiquement rechargés (Hot Reload)

---

**Version:** 1.0.0
**Date:** 2025-10-07
**Status:** ✅ Prêt à tester

**Bon test ! 🍕🚀**
