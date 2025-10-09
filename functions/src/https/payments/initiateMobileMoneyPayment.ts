import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

const db = getFirestore();

// Mobile Money API configuration (Cinetpay API for Burkina Faso)
const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || '';
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || '';
const CINETPAY_API_BASE = process.env.CINETPAY_MODE === 'live'
  ? 'https://api.cinetpay.com/v2'
  : 'https://api-checkout.cinetpay.com/v2';

interface InitiateMobileMoneyData {
  orderId: string;
  amount: number; // Amount in FCFA
  phoneNumber: string; // Customer phone number
  provider: 'orange_money' | 'moov_money' | 'coris_money';
  customerName?: string;
}

/**
 * Initiate Mobile Money payment using Cinetpay
 *
 * Supports:
 * - Orange Money BF
 * - Moov Money BF
 * - Coris Money BF
 *
 * @param orderId - The order ID
 * @param amount - Amount in FCFA
 * @param phoneNumber - Customer phone number (format: +22670123456)
 * @param provider - Mobile money provider
 * @param customerName - Customer name (optional)
 *
 * @returns Payment initiation response with transaction ID
 */
export const initiateMobileMoneyPayment = functions.https.onCall(
  async (data: InitiateMobileMoneyData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to initiate mobile money payment'
      );
    }

    const { orderId, amount, phoneNumber, provider, customerName } = data;

    // Validate input
    if (!orderId || !amount || amount <= 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order ID and positive amount are required'
      );
    }

    if (!phoneNumber || !phoneNumber.match(/^\+226[67]\d{7}$/)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Valid Burkina Faso phone number required (format: +22670123456)'
      );
    }

    if (!['orange_money', 'moov_money', 'coris_money'].includes(provider)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid mobile money provider'
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

      // Get user info
      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const user = userSnap.data();

      // Map provider to Cinetpay channel
      const channelMap = {
        orange_money: 'ORANGE_MONEY_BF',
        moov_money: 'MOOV_MONEY_BF',
        coris_money: 'CORIS_MONEY_BF',
      };

      const channel = channelMap[provider];

      // Generate unique transaction ID
      const transactionId = `PKMM${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Prepare Cinetpay payment request
      const paymentData = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId,
        amount: amount,
        currency: 'XOF', // FCFA
        alternative_currency: '',
        description: `Pizza King Order #${order?.orderNumber}`,
        customer_id: userId,
        customer_name: customerName || `${user?.firstName} ${user?.lastName}`,
        customer_surname: user?.lastName || '',
        customer_email: user?.email || '',
        customer_phone_number: phoneNumber,
        customer_address: order?.deliveryAddress?.address || '',
        customer_city: order?.deliveryAddress?.city || 'Ouagadougou',
        customer_country: 'BF',
        customer_state: 'OUA',
        customer_zip_code: '',
        notify_url: `${process.env.FUNCTIONS_URL}/handleMobileMoneyCallback`,
        return_url: `${process.env.WEB_APP_URL}/checkout/success`,
        channels: channel,
        metadata: JSON.stringify({
          orderId,
          orderNumber: order?.orderNumber,
          userId,
        }),
        lang: 'fr',
        invoice_data: JSON.stringify({
          items: order?.items?.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
          })) || [],
        }),
      };

      // Call Cinetpay API
      const response = await axios.post(
        `${CINETPAY_API_BASE}/payment`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const paymentResponse = response.data;

      if (paymentResponse.code !== '201') {
        throw new functions.https.HttpsError(
          'internal',
          `Payment initiation failed: ${paymentResponse.message}`
        );
      }

      // Update order with mobile money payment info
      await orderRef.update({
        'payment.provider': 'mobile_money',
        'payment.mobileMoneyProvider': provider,
        'payment.transactionId': transactionId,
        'payment.paymentToken': paymentResponse.data.payment_token,
        'payment.paymentUrl': paymentResponse.data.payment_url,
        'payment.phoneNumber': phoneNumber,
        'payment.status': 'pending',
        'payment.createdAt': new Date(),
        updatedAt: new Date(),
      });

      functions.logger.info('Mobile Money payment initiated', {
        orderId,
        transactionId,
        provider,
        amount,
        userId,
      });

      return {
        success: true,
        transactionId,
        paymentToken: paymentResponse.data.payment_token,
        paymentUrl: paymentResponse.data.payment_url,
        provider,
        amount,
        message: 'Veuillez composer le code USSD affiché pour confirmer le paiement',
      };
    } catch (error: any) {
      functions.logger.error('Error initiating mobile money payment', {
        error: error.message,
        response: error.response?.data,
        orderId,
        provider,
        userId,
      });

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to initiate mobile money payment: ${error.message}`
      );
    }
  }
);
