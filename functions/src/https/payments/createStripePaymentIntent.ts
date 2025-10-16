import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const db = getFirestore();

interface CreatePaymentIntentData {
  orderId: string;
  amount: number; // Amount in FCFA
  currency?: string;
  paymentMethodTypes?: string[];
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Payment Intent for an order
 *
 * @param orderId - The order ID
 * @param amount - Amount in FCFA (will be converted to smallest currency unit)
 * @param currency - Currency code (default: 'xof' for FCFA)
 * @param paymentMethodTypes - Payment methods to accept (default: ['card'])
 * @param metadata - Additional metadata
 *
 * @returns Payment Intent with client secret
 */
export const createStripePaymentIntent = functions.https.onCall(
  async (data: CreatePaymentIntentData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to create a payment intent'
      );
    }

    const {
      orderId,
      amount,
      currency = 'xof',
      paymentMethodTypes = ['card'],
      metadata = {},
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
      // Get order to verify ownership and status
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

      // Check order status - should be pending or confirmed
      if (!['pending', 'confirmed'].includes(order?.status)) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Cannot create payment for order with status: ${order?.status}`
        );
      }

      // Check if payment already exists
      if (order?.payment?.status === 'succeeded') {
        throw new functions.https.HttpsError(
          'already-exists',
          'Payment already completed for this order'
        );
      }

      // Amount should match order total (with small tolerance for rounding)
      const orderTotal = order?.pricing?.total || 0;
      const tolerance = 100; // 100 FCFA tolerance
      if (Math.abs(amount - orderTotal) > tolerance) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Amount mismatch: expected ${orderTotal}, got ${amount}`
        );
      }

      // Get customer info
      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const user = userSnap.data();

      // Create or retrieve Stripe customer
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email,
          name: `${user?.firstName} ${user?.lastName}`,
          phone: user?.phoneNumber,
          metadata: {
            userId,
            firebaseUid: userId,
          },
        });
        customerId = customer.id;

        // Save customer ID to user document
        await userRef.update({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        });
      }

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Stripe expects amount in smallest currency unit (FCFA doesn't have subunits)
        currency: currency.toLowerCase(),
        customer: customerId,
        payment_method_types: paymentMethodTypes,
        metadata: {
          orderId,
          userId,
          orderNumber: order?.orderNumber || '',
          ...metadata,
        },
        description: `Pizza King Order #${order?.orderNumber}`,
        receipt_email: user?.email,
        // Enable automatic payment methods
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      // Update order with payment intent info
      await orderRef.update({
        'payment.provider': 'stripe',
        'payment.paymentIntentId': paymentIntent.id,
        'payment.status': 'pending',
        'payment.clientSecret': paymentIntent.client_secret,
        'payment.createdAt': new Date(),
        updatedAt: new Date(),
      });

      functions.logger.info('Payment intent created', {
        orderId,
        paymentIntentId: paymentIntent.id,
        amount,
        userId,
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId,
      };
    } catch (error: any) {
      functions.logger.error('Error creating payment intent', {
        error: error.message,
        orderId,
        userId,
      });

      // Re-throw HttpsErrors as-is
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      // Handle Stripe errors
      if (error.type) {
        throw new functions.https.HttpsError(
          'internal',
          `Stripe error: ${error.message}`
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to create payment intent'
      );
    }
  }
);
