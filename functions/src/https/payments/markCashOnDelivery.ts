import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

interface MarkCashOnDeliveryData {
  orderId: string;
}

/**
 * Mark order as Cash on Delivery
 *
 * This doesn't process payment immediately, but marks the order
 * to be paid in cash upon delivery.
 *
 * @param orderId - The order ID
 *
 * @returns Success confirmation
 */
export const markCashOnDelivery = functions.https.onCall(
  async (data: MarkCashOnDeliveryData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to mark cash on delivery'
      );
    }

    const { orderId } = data;

    if (!orderId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order ID is required'
      );
    }

    const userId = context.auth.uid;

    try {
      // Get order to verify ownership
      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Order not found');
      }

      const order = orderSnap.data();

      // Verify user owns this order
      if (order?.userId !== userId) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to modify this order'
        );
      }

      // Check order status
      if (!['pending'].includes(order?.status)) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Cannot mark cash on delivery for order with status: ${order?.status}`
        );
      }

      // Update order with cash on delivery
      await orderRef.update({
        'payment.provider': 'cash',
        'payment.method': 'cash_on_delivery',
        'payment.status': 'pending_cash',
        'payment.markedAt': new Date(),
        'payment.note': 'Paiement en espèces à la livraison',
        status: 'confirmed', // Confirm order even though payment is pending
        updatedAt: new Date(),
      });

      // Create notification
      await db.collection('notifications').add({
        userId,
        type: 'order_confirmed',
        title: 'Commande confirmée',
        message: `Votre commande #${order?.orderNumber} a été confirmée. Paiement en espèces à la livraison.`,
        data: {
          orderId,
          orderNumber: order?.orderNumber,
          paymentMethod: 'cash_on_delivery',
        },
        read: false,
        createdAt: new Date(),
      });

      functions.logger.info('Order marked as cash on delivery', {
        orderId,
        orderNumber: order?.orderNumber,
        userId,
      });

      return {
        success: true,
        message: 'Commande confirmée. Paiement en espèces à la livraison.',
        orderId,
        orderNumber: order?.orderNumber,
      };
    } catch (error: any) {
      functions.logger.error('Error marking cash on delivery', {
        error: error.message,
        orderId,
        userId,
      });

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to mark cash on delivery: ${error.message}`
      );
    }
  }
);

/**
 * Confirm cash payment received by deliverer
 *
 * Called by deliverer when they receive cash payment
 *
 * @param orderId - The order ID
 * @param amountReceived - Amount received in FCFA
 *
 * @returns Success confirmation
 */
export const confirmCashPaymentReceived = functions.https.onCall(
  async (data: { orderId: string; amountReceived: number }, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { orderId, amountReceived } = data;

    if (!orderId || !amountReceived) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order ID and amount received are required'
      );
    }

    const userId = context.auth.uid;

    try {
      // Get order
      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Order not found');
      }

      const order = orderSnap.data();

      // Verify user is the assigned deliverer
      if (order?.delivererId !== userId) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Only the assigned deliverer can confirm cash payment'
        );
      }

      // Verify payment method is cash
      if (order?.payment?.method !== 'cash_on_delivery') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'This is not a cash on delivery order'
        );
      }

      // Verify order is delivered
      if (order?.status !== 'delivered') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Order must be delivered before confirming payment'
        );
      }

      // Update payment status
      await orderRef.update({
        'payment.status': 'succeeded',
        'payment.amountReceived': amountReceived,
        'payment.receivedBy': userId,
        'payment.paidAt': new Date(),
        updatedAt: new Date(),
      });

      // Notify customer
      await db.collection('notifications').add({
        userId: order?.userId,
        type: 'payment_received',
        title: 'Paiement reçu',
        message: `Le livreur a confirmé la réception de votre paiement de ${amountReceived} FCFA.`,
        data: {
          orderId,
          orderNumber: order?.orderNumber,
          amountReceived,
        },
        read: false,
        createdAt: new Date(),
      });

      functions.logger.info('Cash payment confirmed', {
        orderId,
        amountReceived,
        delivererId: userId,
      });

      return {
        success: true,
        message: 'Paiement en espèces confirmé',
      };
    } catch (error: any) {
      functions.logger.error('Error confirming cash payment', {
        error: error.message,
        orderId,
        userId,
      });

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to confirm cash payment: ${error.message}`
      );
    }
  }
);
