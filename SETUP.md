# 🚀 Guide de Setup - Pizza King

Ce guide vous accompagne pour configurer l'environnement de développement de Pizza King.

## ✅ Prérequis

### Logiciels requis

1. **Node.js** (version 20.x ou supérieure)
   ```bash
   node --version  # Doit afficher v20.x.x
   ```
   Télécharger : https://nodejs.org/

2. **pnpm** (version 9.x ou supérieure)
   ```bash
   npm install -g pnpm
   pnpm --version  # Doit afficher 9.x.x
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

5. **Expo CLI** (pour mobile)
   ```bash
   npm install -g @expo/cli
   ```

### Comptes nécessaires

- [ ] Compte Firebase (https://console.firebase.google.com)
- [ ] Compte Stripe (https://dashboard.stripe.com)
- [ ] Compte Twilio (optionnel) (https://www.twilio.com)
- [ ] Compte SendGrid (optionnel) (https://sendgrid.com)
- [ ] Compte Google Cloud (pour Maps API)

---

## 📥 Installation Initiale

### 1. Cloner le projet

```bash
git clone https://github.com/votre-org/pizza-king.git
cd pizza-king
```

### 2. Installer les dépendances

```bash
# Installer toutes les dépendances du monorepo
pnpm install
```

Cette commande va installer les dépendances pour :
- Le projet racine
- L'application web (apps/web)
- L'application mobile (apps/mobile)
- Les Cloud Functions (functions)
- Les packages partagés (packages/shared)

---

## 🔥 Configuration Firebase

### 1. Créer un projet Firebase

1. Aller sur https://console.firebase.google.com
2. Cliquer sur "Ajouter un projet"
3. Nom du projet : `pizza-king` (ou autre)
4. Activer Google Analytics (recommandé)

### 2. Activer les services Firebase

Dans la console Firebase, activer :

- [ ] **Authentication**
  - Email/Password
  - Phone (OTP)
  - Google

- [ ] **Firestore Database**
  - Mode : Production
  - Région : europe-west (ou proche de vous)

- [ ] **Storage**
  - Région : europe-west

- [ ] **Cloud Functions**
  - Plan : Blaze (pay-as-you-go, nécessaire pour les fonctions)

- [ ] **Cloud Messaging** (FCM)
  - Pour les notifications push

- [ ] **Hosting**
  - Pour héberger le site web

### 3. Récupérer les clés Firebase

1. Dans la console Firebase, aller dans **Paramètres du projet** (⚙️)
2. Onglet **Général**
3. Scroller jusqu'à "Vos applications"
4. Cliquer sur "Ajouter une application" > Web (</> icône)
5. Nom : "Pizza King Web"
6. Copier la configuration Firebase

### 4. Configurer les variables d'environnement

#### Pour le web (apps/web)

```bash
cp .env.example apps/web/.env.local
```

Éditer `apps/web/.env.local` et remplir :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

#### Pour le mobile (apps/mobile)

```bash
cp .env.example apps/mobile/.env
```

Éditer `apps/mobile/.env` (mêmes valeurs que web)

#### Pour les functions (functions)

```bash
cp .env.example functions/.env
```

Éditer `functions/.env` et ajouter les clés API des services externes.

### 5. Se connecter à Firebase CLI

```bash
firebase login
firebase use --add
# Sélectionner le projet créé
```

### 6. Déployer les règles de sécurité

```bash
# Déployer les règles Firestore et Storage
firebase deploy --only firestore:rules,storage:rules
```

---

## 🗺️ Configuration Google Maps

### 1. Activer l'API Google Maps

1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet ou sélectionner le projet Firebase
3. Activer les APIs :
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Distance Matrix API

### 2. Créer une clé API

1. Dans la console Google Cloud : **APIs & Services** > **Credentials**
2. Créer une clé API
3. Restreindre la clé aux APIs activées ci-dessus
4. Ajouter la clé dans `.env.local` :
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle
   ```

---

## 💳 Configuration Stripe

### 1. Créer un compte Stripe

1. S'inscrire sur https://dashboard.stripe.com/register
2. Activer le mode test

### 2. Récupérer les clés

1. Dans Dashboard > Developers > API keys
2. Copier :
   - Publishable key (pk_test_xxx)
   - Secret key (sk_test_xxx)

3. Ajouter dans `.env.local` :
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   ```

### 3. Configurer les webhooks

1. Dashboard > Developers > Webhooks
2. Ajouter un endpoint : `https://votre-domaine.com/api/webhooks/stripe`
3. Événements à écouter :
   - payment_intent.succeeded
   - payment_intent.payment_failed
4. Copier le webhook secret et ajouter dans `.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

---

## 📧 Configuration SendGrid (Email)

### 1. Créer un compte SendGrid

1. S'inscrire sur https://signup.sendgrid.com
2. Vérifier votre email

### 2. Créer une clé API

1. Settings > API Keys > Create API Key
2. Nom : "Pizza King"
3. Permissions : Full Access
4. Copier la clé

3. Ajouter dans `functions/.env` :
   ```env
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_FROM_EMAIL=noreply@pizzaking.com
   ```

### 3. Vérifier le domaine d'envoi

1. Settings > Sender Authentication
2. Vérifier votre domaine ou créer un single sender

---

## 📱 Configuration Twilio (SMS/WhatsApp)

### 1. Créer un compte Twilio

1. S'inscrire sur https://www.twilio.com/try-twilio
2. Récupérer Account SID et Auth Token

### 2. Acheter un numéro de téléphone

1. Phone Numbers > Buy a Number
2. Choisir un numéro avec SMS capability

### 3. Ajouter dans `functions/.env`

```env
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🧪 Tester l'installation

### 1. Lancer les émulateurs Firebase

```bash
pnpm emulators
```

Ouvrir http://localhost:4000 pour accéder à l'interface des émulateurs.

### 2. Lancer le site web

```bash
pnpm dev:web
```

Ouvrir http://localhost:3000

### 3. Lancer l'app mobile

```bash
pnpm dev:mobile
```

Scanner le QR code avec l'app Expo Go.

### 4. Tester une commande complète

1. ✅ S'inscrire avec email/mot de passe
2. ✅ Parcourir le menu
3. ✅ Ajouter des pizzas au panier
4. ✅ Passer une commande test (mode sandbox)
5. ✅ Vérifier que la commande apparaît dans Firestore

---

## 🌱 Initialiser la base de données

### Créer des données de test

```bash
pnpm seed
```

Cela va créer :
- 10 pizzas de test
- 5 promotions
- 1 compte admin (admin@pizzaking.com / Admin123!)
- 1 compte livreur (livreur@pizzaking.com / Livreur123!)

---

## 🐛 Dépannage

### Erreur : "Firebase not configured"

➡️ Vérifier que les variables d'environnement sont bien définies dans `.env.local`

### Erreur : "Permission denied" Firestore

➡️ Vérifier que les règles de sécurité sont déployées :
```bash
firebase deploy --only firestore:rules
```

### Erreur : pnpm command not found

➡️ Installer pnpm globalement :
```bash
npm install -g pnpm
```

### L'app mobile ne se connecte pas à Firebase

➡️ Vérifier que le fichier `.env` existe dans `apps/mobile/`

### Les émulateurs ne démarrent pas

➡️ Vérifier que les ports 4000, 5001, 8080, 9099, 9199 sont libres

---

## 📚 Prochaines étapes

Une fois le setup terminé :

1. ✅ Lire la [ROADMAP.md](./ROADMAP.md)
2. ✅ Consulter le [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
3. ✅ Explorer la [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
4. ✅ Commencer le développement !

---

## ✅ Checklist finale

Avant de commencer le développement, vérifier :

- [ ] Node.js 20+ installé
- [ ] pnpm 9+ installé
- [ ] Firebase CLI installé
- [ ] Projet Firebase créé
- [ ] Services Firebase activés (Auth, Firestore, Storage, Functions, FCM)
- [ ] Variables d'environnement configurées
- [ ] Règles de sécurité déployées
- [ ] Stripe configuré (mode test)
- [ ] Google Maps API key configurée
- [ ] SendGrid configuré (optionnel)
- [ ] Twilio configuré (optionnel)
- [ ] Émulateurs Firebase fonctionnels
- [ ] Application web démarre sur localhost:3000
- [ ] Application mobile démarre avec Expo
- [ ] Données de test créées

---

**Besoin d'aide ?**
- Documentation : [docs/](./docs/)
- Issues : [GitHub Issues](https://github.com/votre-org/pizza-king/issues)
- Email : dev@pizzaking.com

**Bon développement ! 🍕🚀**
