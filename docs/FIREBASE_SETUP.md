# 🔥 Guide de Configuration Firebase - Pizza King

## Étape 1 : Créer le projet Firebase

### 1.1 Accéder à la console Firebase

1. Aller sur https://console.firebase.google.com
2. Cliquer sur "Ajouter un projet" ou "Create a project"

### 1.2 Configurer le projet

1. **Nom du projet** : `pizza-king` (ou votre choix)
2. **Google Analytics** : ✅ Activer (recommandé)
3. **Compte Analytics** : Sélectionner ou créer un compte
4. Cliquer sur "Créer le projet"

⏱️ Attendre 1-2 minutes que le projet soit créé...

---

## Étape 2 : Activer les services Firebase

### 2.1 Authentication

1. Dans le menu latéral : **Build** > **Authentication**
2. Cliquer sur "Get started"
3. Activer les méthodes de connexion :

   **Email/Password**
   - Cliquer sur "Email/Password"
   - Activer ✅
   - Sauvegarder

   **Phone (SMS)**
   - Cliquer sur "Phone"
   - Activer ✅
   - Sauvegarder

   **Google**
   - Cliquer sur "Google"
   - Activer ✅
   - Email de support : votre-email@example.com
   - Sauvegarder

### 2.2 Firestore Database

1. Dans le menu : **Build** > **Firestore Database**
2. Cliquer sur "Create database"
3. **Mode** : Sélectionner "Start in production mode"
4. **Région** : Choisir `europe-west` (ou proche de vous)
5. Cliquer sur "Enable"

⏱️ Attendre quelques secondes...

### 2.3 Storage

1. Dans le menu : **Build** > **Storage**
2. Cliquer sur "Get started"
3. **Règles de sécurité** : Laisser par défaut (on déploiera nos règles après)
4. **Région** : `europe-west` (même région que Firestore)
5. Cliquer sur "Done"

### 2.4 Cloud Functions

1. Dans le menu : **Build** > **Functions**
2. Cliquer sur "Get started"
3. **IMPORTANT** : Upgrader vers le plan **Blaze (Pay as you go)**
   - Cliquer sur "Upgrade project"
   - Ajouter une méthode de paiement
   - ⚠️ Pas d'inquiétude : Le plan gratuit Spark est inclus dans Blaze
   - Vous ne payerez que si vous dépassez les quotas gratuits (rare en développement)

### 2.5 Cloud Messaging (FCM)

1. Dans le menu : **Build** > **Cloud Messaging**
2. Rien à faire, FCM est activé automatiquement ✅

### 2.6 Hosting

1. Dans le menu : **Build** > **Hosting**
2. Cliquer sur "Get started"
3. Suivre les instructions (on configurera plus tard)

---

## Étape 3 : Récupérer les clés de configuration

### 3.1 Créer une application Web

1. Sur la page d'accueil du projet, cliquer sur l'icône **Web** `</>`
2. **Nom de l'app** : "Pizza King Web"
3. ✅ Cocher "Also set up Firebase Hosting"
4. Cliquer sur "Register app"

### 3.2 Copier la configuration

Vous verrez un code comme celui-ci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "pizza-king-xxxxx.firebaseapp.com",
  projectId: "pizza-king-xxxxx",
  storageBucket: "pizza-king-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

📋 **Copier ces valeurs**, on va les utiliser maintenant !

---

## Étape 4 : Configurer les variables d'environnement

### 4.1 Application Web (Next.js)

Créer le fichier `apps/web/.env.local` :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pizza-king-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pizza-king-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pizza-king-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Autres services (à configurer plus tard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### 4.2 Application Mobile (React Native)

Créer le fichier `apps/mobile/.env` :

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pizza-king-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pizza-king-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pizza-king-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4.3 Cloud Functions

Créer le fichier `functions/.env` :

```env
# Firebase (auto-configuré dans Cloud Functions, mais utile pour local)
FIREBASE_PROJECT_ID=pizza-king-xxxxx

# Services externes (à configurer plus tard)
STRIPE_SECRET_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=
```

---

## Étape 5 : Initialiser Firebase CLI

### 5.1 Installer Firebase CLI (si pas déjà fait)

```bash
npm install -g firebase-tools
```

### 5.2 Se connecter

```bash
firebase login
```

Cela ouvrira votre navigateur pour vous connecter avec votre compte Google.

### 5.3 Lier le projet local au projet Firebase

```bash
# Dans le dossier racine du projet
firebase use --add
```

1. Sélectionner le projet créé (`pizza-king-xxxxx`)
2. Alias : `default`

### 5.4 Vérifier la configuration

```bash
firebase projects:list
```

Vous devriez voir votre projet listé ✅

---

## Étape 6 : Déployer les règles de sécurité

### 6.1 Déployer Firestore Rules et Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

✅ Vous devriez voir :
```
✔  Deploy complete!
```

### 6.2 Déployer Storage Rules

```bash
firebase deploy --only storage:rules
```

✅ Success !

---

## Étape 7 : Tester avec les émulateurs Firebase

### 7.1 Lancer les émulateurs

```bash
pnpm emulators
# ou
firebase emulators:start
```

Cela lancera :
- 🔥 Firestore Emulator (port 8080)
- 🔐 Auth Emulator (port 9099)
- 💾 Storage Emulator (port 9199)
- ⚡ Functions Emulator (port 5001)
- 🌐 Hosting Emulator (port 5000)
- 🎛️ Emulator UI (port 4000)

### 7.2 Accéder à l'interface

Ouvrir http://localhost:4000 dans votre navigateur

Vous verrez l'interface des émulateurs avec :
- Overview
- Firestore
- Authentication
- Storage
- Functions
- Logs

---

## Étape 8 : Créer un compte admin de test

### 8.1 Via l'Emulator UI

1. Ouvrir http://localhost:4000
2. Aller dans **Authentication**
3. Cliquer sur "Add user"
4. Email : `admin@pizzaking.com`
5. Password : `Admin123!`
6. Cliquer sur "Save"

### 8.2 Ajouter le rôle admin dans Firestore

1. Aller dans **Firestore**
2. Collection : `users`
3. Document ID : (copier l'UID de l'utilisateur créé)
4. Ajouter les champs :
   ```
   email: "admin@pizzaking.com"
   role: "admin"
   displayName: "Admin Pizza King"
   status: "active"
   createdAt: (Timestamp) now
   ```

---

## Étape 9 : Vérifier que tout fonctionne

### Checklist ✅

- [ ] Projet Firebase créé
- [ ] Authentication activé (Email, Phone, Google)
- [ ] Firestore Database créé
- [ ] Storage activé
- [ ] Plan Blaze activé (pour Functions)
- [ ] Variables d'environnement configurées
- [ ] Firebase CLI connecté
- [ ] Règles de sécurité déployées
- [ ] Émulateurs lancés avec succès
- [ ] Compte admin de test créé

---

## 🎉 Félicitations !

Firebase est maintenant complètement configuré ! Vous pouvez :

1. ✅ Développer en local avec les émulateurs
2. ✅ Tester l'authentification
3. ✅ Créer des données dans Firestore
4. ✅ Uploader des fichiers dans Storage

---

## 🔧 Commandes utiles

```bash
# Lancer les émulateurs
firebase emulators:start

# Déployer les règles uniquement
firebase deploy --only firestore:rules,storage:rules

# Déployer les functions
firebase deploy --only functions

# Déployer le hosting
firebase deploy --only hosting

# Déployer tout
firebase deploy

# Voir les logs des functions
firebase functions:log

# Lister les projets
firebase projects:list
```

---

## 🐛 Dépannage

### Erreur : "Billing account not configured"

➡️ Vous devez upgrader vers le plan Blaze pour utiliser Cloud Functions.

### Erreur : "Permission denied" lors du déploiement

➡️ Vérifier que vous êtes connecté : `firebase login`

### Les émulateurs ne démarrent pas

➡️ Vérifier que les ports ne sont pas déjà utilisés :
- 4000, 5000, 5001, 8080, 9099, 9199

### L'app ne se connecte pas à Firebase

➡️ Vérifier que les variables d'environnement sont bien définies dans `.env.local`

---

## 📚 Prochaines étapes

Une fois Firebase configuré :

1. ✅ Créer les applications (Next.js, React Native, Functions)
2. ✅ Initialiser Firebase dans le code
3. ✅ Créer les premières collections Firestore
4. ✅ Tester l'authentification

Voir [NEXT_STEPS.md](../NEXT_STEPS.md) pour continuer !

---

**Configuration Firebase terminée ! 🚀**
