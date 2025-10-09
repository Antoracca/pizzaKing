# @pizza-king/firebase-config

Configuration Firebase partagée pour l'ensemble de la plateforme Pizza King.

## Installation

Ce package est utilisé en interne via pnpm workspace.

```bash
pnpm add @pizza-king/firebase-config --filter <app-name>
```

## Usage

### Client (Web & Mobile)

```typescript
import { initializeFirebase, auth, db, storage } from '@pizza-king/firebase-config';

// Initialize Firebase (call once at app startup)
initializeFirebase();

// Use Firebase services
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

// Auth
await signInWithEmailAndPassword(auth, email, password);

// Firestore
const snapshot = await getDocs(collection(db, 'pizzas'));
```

### Server (Cloud Functions)

```typescript
import { initializeFirebaseAdmin, admin } from '@pizza-king/firebase-config';

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Use Admin SDK
const users = await admin.firestore().collection('users').get();
```

### Collections Names

```typescript
import { COLLECTIONS } from '@pizza-king/firebase-config';

// Use predefined collection names
const pizzasRef = collection(db, COLLECTIONS.PIZZAS);
const ordersRef = collection(db, COLLECTIONS.ORDERS);
```

## Configuration

Set environment variables in your app:

### Web (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### Mobile (.env)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
# ... same keys with EXPO_PUBLIC_ prefix
```

### Functions
Admin SDK uses Application Default Credentials automatically in Cloud Functions.
