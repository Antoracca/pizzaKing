import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

const db = getFirestore();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

interface CapturePayPalOrderData {
  orderId: string;
  paypalOrderId: string;
}

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

/**
 * Capture a PayPal order after user approval
 *
 * This function is called after the user approves the payment on PayPal
 *
 * @param orderId - The order ID
 * @param paypalOrderId - The PayPal order ID
 *
 * @returns Capture details
 */
export const capturePayPalOrder = functions.https.onCall(
  async (data: CapturePayPalOrderData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to capture PayPal order'
      );
    }

    const { orderId, paypalOrderId } = data;

    if (!orderId || !paypalOrderId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order ID and PayPal order ID are required'
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
          'You do not have permission to capture payment for this order'
        );
      }

      // Verify PayPal order ID matches
      if (order?.payment?.paypalOrderId !== paypalOrderId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'PayPal order ID mismatch'
        );
      }

      // Get PayPal access token
      const accessToken = await getPayPalAccessToken();

      // Capture the PayPal order
      const captureResponse = await axios.post(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const captureData = captureResponse.data;

      // Check capture status
      if (captureData.status !== 'COMPLETED') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `PayPal capture failed with status: ${captureData.status}`
        );
      }

      const capture = captureData.purchase_units[0].payments.captures[0];

      // Update order with successful payment
      await orderRef.update({
        'payment.status': 'succeeded',
        'payment.captureId': capture.id,
        'payment.paidAt': new Date(),
        'payment.paypalStatus': captureData.status,
        status: 'confirmed',
        updatedAt: new Date(),
      });

      // Create notification
      await db.collection('notifications').add({
        userId,
        type: 'payment_success',
        title: 'Paiement PayPal réussi',
        message: `Votre paiement PayPal a été confirmé. Commande #${order?.orderNumber}`,
        data: {
          orderId,
          orderNumber: order?.orderNumber,
          captureId: capture.id,
        },
        read: false,
        createdAt: new Date(),
      });

      functions.logger.info('PayPal order captured', {
        orderId,
        paypalOrderId,
        captureId: capture.id,
        userId,
      });

      return {
        success: true,
        captureId: capture.id,
        status: captureData.status,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
      };
    } catch (error: any) {
      functions.logger.error('Error capturing PayPal order', {
        error: error.message,
        response: error.response?.data,
        orderId,
        paypalOrderId,
        userId,
      });

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to capture PayPal order: ${error.message}`
      );
    }
  }
);
