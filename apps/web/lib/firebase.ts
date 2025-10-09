'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore /* , initializeFirestore */ } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';

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
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

if (!isFirebaseConfigured) {
  throw new Error('Firebase configuration required. Confirm your .env.local values.');
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// --- Option simple (recommandée) ---
const db = getFirestore(app);

// --- Option avancée (si tu tiens à un databaseId dédié) ---
// initializeFirestore(app, {}, 'pizzaking');
// const db = getFirestore(app);

const storage = getStorage(app);

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
console.log('✅ Firebase initialized successfully for project:', firebaseConfig.projectId);

export { app, auth, db, storage, analytics, isFirebaseConfigured };
