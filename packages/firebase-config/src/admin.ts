import * as admin from 'firebase-admin';

let app: admin.app.App;

/**
 * Initialize Firebase Admin SDK
 * Used in Cloud Functions and server-side operations
 */
export const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    // In Cloud Functions, credentials are automatic
    // For local development, set GOOGLE_APPLICATION_CREDENTIALS env var
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    app = admin.apps[0] as admin.app.App;
  }

  return app;
};

/**
 * Get Firebase Admin instances
 */
export const getAdminInstances = (): {
  app: admin.app.App;
  auth: admin.auth.Auth;
  db: admin.firestore.Firestore;
  storage: admin.storage.Storage;
  messaging: admin.messaging.Messaging;
} => {
  if (!app) {
    initializeFirebaseAdmin();
  }

  return {
    app,
    auth: admin.auth(),
    db: admin.firestore(),
    storage: admin.storage(),
    messaging: admin.messaging(),
  };
};

// Export admin namespace for direct usage
export { admin };
