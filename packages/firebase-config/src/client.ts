import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

/**
 * Initialize Firebase Client SDK
 * Call this once at app startup
 */
export const initializeFirebase = () => {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Analytics only in browser environment
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }

    console.log('✅ Firebase initialized');
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    if (typeof window !== 'undefined' && !analytics) {
      analytics = getAnalytics(app);
    }
  }

  return { app, auth, db, storage, analytics };
};

/**
 * Get Firebase instances
 * Make sure to call initializeFirebase() first
 */
export const getFirebaseInstances = () => {
  if (!app) {
    return initializeFirebase();
  }
  return { app, auth, db, storage, analytics };
};

// Export individual instances for convenience
export { app, auth, db, storage, analytics };
