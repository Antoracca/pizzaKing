import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK for server-side operations
if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin initialized with service account credentials');
    } catch (error) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
    }
  } else {
    console.warn('⚠️ No FIREBASE_SERVICE_ACCOUNT_KEY found in environment');
    console.warn('⚠️ Attempting to use Application Default Credentials (ADC)');
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

// Get Firestore instance with named database 'pizzaking'
const adminDb = getFirestore();
adminDb.settings({ databaseId: 'pizzaking' });

// Get Auth instance for token verification
const adminAuth = getAuth();

console.log('✅ Firebase Admin configured for database: pizzaking');

export { adminDb, adminAuth };
