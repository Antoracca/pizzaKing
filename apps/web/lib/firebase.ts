'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration - PizzaKing Production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

if (!isFirebaseConfigured) {
  throw new Error(
    'Firebase configuration required. Confirm your .env.local values.'
  );
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Firestore with named database 'pizzaking'
const db = initializeFirestore(app, {}, 'pizzaking');

const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1'); // Région explicite

// Initialize Analytics only on client-side
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch {
    // eslint-disable-next-line no-console
    console.log('ℹ️ Analytics not available in this environment.');
  }
}

// eslint-disable-next-line no-console
console.log(
  '✅ Firebase initialized successfully for project:',
  firebaseConfig.projectId
);

export { app, auth, db, storage, functions, analytics, isFirebaseConfigured };

// Optional: connect to Firebase emulators in local dev
if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_USE_EMULATORS === '1'
) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    // eslint-disable-next-line no-console
    console.log('Connected to Firebase emulators (auth, firestore, functions).');
  } catch {
    // eslint-disable-next-line no-console
    console.log('Emulator connection failed or already connected.');
  }
}
