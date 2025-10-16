import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import Constants from 'expo-constants';

// Firebase configuration - PizzaKing Production
const firebaseConfig = {
  apiKey:
    Constants.expoConfig?.extra?.firebaseApiKey ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    Constants.expoConfig?.extra?.firebaseAuthDomain ||
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    Constants.expoConfig?.extra?.firebaseProjectId ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    Constants.expoConfig?.extra?.firebaseStorageBucket ||
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    Constants.expoConfig?.extra?.firebaseMessagingSenderId ||
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:
    Constants.expoConfig?.extra?.firebaseAppId ||
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId:
    Constants.expoConfig?.extra?.firebaseMeasurementId ||
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

if (!isFirebaseConfigured) {
  console.error('❌ Firebase configuration is missing! Check your .env file');
  throw new Error('Firebase configuration required. Please check .env file.');
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Use the specific database ID "pizzaking" in africa-south1
const db = getFirestore(app, 'pizzaking');
const storage = getStorage(app);

// Analytics (mobile)
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

console.log(
  '✅ Firebase initialized successfully for project:',
  firebaseConfig.projectId
);

export { app, auth, db, storage, analytics, isFirebaseConfigured };
