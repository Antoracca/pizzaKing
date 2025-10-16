import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

const db = getFirestore();

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

interface CreatePayPalOrderData {
  orderId: string;
  amount: number; // Amount in FCFA
  currency?: string;
  returnUrl?: string;
  cancelUrl?: string;
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
 * Convert FCFA to USD (approximate rate: 1 USD = 600 FCFA)
 */
function convertFCFAtoUSD(amountFCFA: number): number {
  const rate = 600; // Approximate conversion rate
  return Math.round((amountFCFA / rate) * 100) / 100; // Round to 2 decimals
}

/**
 * Create a PayPal order for payment
 *
 * @param orderId - The order ID
 * @param amount - Amount in FCFA
 * @param currency - Currency code (will be converted to USD)
 * @param returnUrl - URL to redirect after successful payment
 * @param cancelUrl - URL to redirect if payment is canceled
 *
 * @returns PayPal order with approval URL
 */
export const createPayPalOrder = functions.https.onCall(
  async (data: CreatePayPalOrderData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to create a PayPal order'
      );
    }

    const {
      orderId,
      amount,
      returnUrl = `${process.env.WEB_APP_URL}/checkout/success`,
      cancelUrl = `${process.env.WEB_APP_URL}/checkout/cancel`,
    } = data;

    // Validate input
    if (!orderId || !amount || amount <= 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order ID and positive amount are required'
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
          'You do not have permission to create payment for this order'
        );
      }

      // Check order status
      if (!['pending', 'confirmed'].includes(order?.status)) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Cannot create payment for order with status: ${order?.status}`
        );
      }

      // Convert FCFA to USD
      const amountUSD = convertFCFAtoUSD(amount);

      // Get PayPal access token
      const accessToken = await getPayPalAccessToken();

      // Create PayPal order
      const paypalOrderResponse = await axios.post(
        `${PAYPAL_API_BASE}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: orderId,
              description: `Pizza King Order #${order?.orderNumber}`,
              custom_id: orderId,
              soft_descriptor: 'PIZZAKING',
              amount: {
                currency_code: 'USD',
                value: amountUSD.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: amountUSD.toFixed(2),
                  },
                },
              },
              items:
                order?.items?.map((item: any) => ({
                  name: item.name,
                  quantity: item.quantity.toString(),
                  unit_amount: {
                    currency_code: 'USD',
                    value: convertFCFAtoUSD(item.price).toFixed(2),
                  },
                })) || [],
            },
          ],
          application_context: {
            brand_name: 'Pizza King',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const paypalOrder = paypalOrderResponse.data;

      // Find approval URL
      const approvalUrl = paypalOrder.links.find(
        (link: any) => link.rel === 'approve'
      )?.href;

      // Update order with PayPal info
      await orderRef.update({
        'payment.provider': 'paypal',
        'payment.paypalOrderId': paypalOrder.id,
        'payment.status': 'pending',
        'payment.approvalUrl': approvalUrl,
        'payment.amountUSD': amountUSD,
        'payment.conversionRate': 600,
        'payment.createdAt': new Date(),
        updatedAt: new Date(),
      });

      functions.logger.info('PayPal order created', {
        orderId,
        paypalOrderId: paypalOrder.id,
        amountFCFA: amount,
        amountUSD,
        userId,
      });

      return {
        success: true,
        paypalOrderId: paypalOrder.id,
        approvalUrl,
        amountUSD,
        amountFCFA: amount,
      };
    } catch (error: any) {
      functions.logger.error('Error creating PayPal order', {
        error: error.message,
        response: error.response?.data,
        orderId,
        userId,
      });

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to create PayPal order: ${error.message}`
      );
    }
  }
);
