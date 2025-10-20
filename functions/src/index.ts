import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Configure Firestore to use 'pizzaking' database (MUST be done immediately after initializeApp)
const db = admin.firestore();
db.settings({
  databaseId: 'pizzaking',
});

/**
 * Example HTTP Function
 * Call: POST https://region-project.cloudfunctions.net/helloWorld
 */
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.json({ message: 'Hello from Firebase! 🍕' });
});

/**
 * Example Callable Function
 * Call from client: functions.httpsCallable('getPizzaMenu')()
 */
export const getPizzaMenu = functions.https.onCall(async (data, context) => {
  // Verify auth if needed
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // TODO: Get pizzas from Firestore
  return {
    success: true,
    pizzas: [],
    message: 'Menu retrieved successfully',
  };
});

/**
 * Example Firestore Trigger
 * Triggered when a new order is created
 */
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const order = snapshot.data();
    const orderId = context.params.orderId;

    functions.logger.info(`New order created: ${orderId}`, { order });

    // TODO: Send notification to user
    // TODO: Send notification to admin
    // TODO: Update analytics

    return null;
  });

/**
 * Example Scheduled Function
 * Runs every day at midnight
 */
export const dailyCleanup = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Africa/Central Africa republic')
  .onRun(async context => {
    functions.logger.info('Running daily cleanup');

    // TODO: Clean up expired promotions
    // TODO: Send daily report
    // TODO: Archive old orders

    return null;
  });

// Export authentication functions
export { onUserCreate } from './triggers/onUserCreate';
export { setUserRole } from './https/setUserRole';
export { setCustomClaims } from './https/setCustomClaims';
