import * as functions from 'firebase-functions';
import { initializeFirebaseAdmin } from '@pizza-king/firebase-config';

// Initialize Firebase Admin
initializeFirebaseAdmin();

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
  .timeZone('Africa/Ouagadougou')
  .onRun(async context => {
    functions.logger.info('Running daily cleanup');

    // TODO: Clean up expired promotions
    // TODO: Send daily report
    // TODO: Archive old orders

    return null;
  });

// Export authentication functions
export { onUserCreate } from './triggers/onUserCreate';
export { verifyPhoneNumber } from './https/verifyPhoneNumber';
export { sendVerificationCode } from './https/sendVerificationCode';
export { setUserRole } from './https/setUserRole';

// Export order functions
export { createOrder } from './https/orders/createOrder';
export { updateOrderStatus } from './https/orders/updateOrderStatus';
export { getOrderById } from './https/orders/getOrderById';

// Export menu functions
export { getMenu } from './https/menu/getMenu';
export { managePizza } from './https/menu/managePizza';

// Export triggers
export { onOrderUpdate } from './triggers/onOrderUpdate';

// Export scheduled functions
export { dailyAnalytics } from './scheduled/dailyAnalytics';
export { expirePromotions } from './scheduled/expirePromotions';

// Export payment functions
export { createStripePaymentIntent } from './https/payments/createStripePaymentIntent';
export { handleStripeWebhook } from './https/payments/handleStripeWebhook';
export { createPayPalOrder } from './https/payments/createPayPalOrder';
export { capturePayPalOrder } from './https/payments/capturePayPalOrder';
export { initiateMobileMoneyPayment } from './https/payments/initiateMobileMoneyPayment';
export { handleMobileMoneyCallback } from './https/payments/handleMobileMoneyCallback';
export {
  markCashOnDelivery,
  confirmCashPaymentReceived,
} from './https/payments/markCashOnDelivery';
