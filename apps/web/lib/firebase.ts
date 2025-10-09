'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

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
  console.error('❌ Firebase configuration is missing! Check your .env.local file');
  throw new Error('Firebase configuration required. Please check .env.local file.');
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Use the specific database ID "pizzaking" in africa-south1
const db = getFirestore(app, 'pizzaking');
const storage = getStorage(app);

// Initialize Analytics only on client-side
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

console.log('✅ Firebase initialized successfully for project:', firebaseConfig.projectId);

export { app, auth, db, storage, analytics, isFirebaseConfigured };
