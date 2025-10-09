import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const db = getFirestore();
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Handle Stripe webhooks for payment events
 *
 * Events handled:
 * - payment_intent.succeeded: Payment completed successfully
 * - payment_intent.payment_failed: Payment failed
 * - payment_intent.canceled: Payment was canceled
 * - charge.refunded: Payment was refunded
 */
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    functions.logger.error('Missing Stripe signature');
    res.status(400).send('Missing signature');
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (error: any) {
    functions.logger.error('Webhook signature verification failed', { error: error.message });
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  functions.logger.info('Stripe webhook received', {
    type: event.type,
    id: event.id,
  });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        functions.logger.info('Unhandled event type', { type: event.type });
    }

    res.json({ received: true });
  } catch (error: any) {
    functions.logger.error('Error processing webhook', {
      error: error.message,
      eventType: event.type,
    });
    res.status(500).send('Webhook processing failed');
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    functions.logger.error('No orderId in payment intent metadata');
    return;
  }

  const orderRef = db.collection('orders').doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    functions.logger.error('Order not found', { orderId });
    return;
  }

  const order = orderSnap.data();

  // Update order payment status
  await orderRef.update({
    'payment.status': 'succeeded',
    'payment.paidAt': new Date(),
    'payment.paymentMethod': paymentIntent.payment_method_types[0],
    'payment.receiptUrl': paymentIntent.charges?.data[0]?.receipt_url,
    status: 'confirmed', // Move order to confirmed status
    updatedAt: new Date(),
  });

  // Create notification for user
  await db.collection('notifications').add({
    userId: order?.userId,
    type: 'payment_success',
    title: 'Paiement réussi',
    message: `Votre paiement de ${paymentIntent.amount} FCFA a été confirmé. Commande #${order?.orderNumber}`,
    data: {
      orderId,
      orderNumber: order?.orderNumber,
      amount: paymentIntent.amount,
    },
    read: false,
    createdAt: new Date(),
  });

  functions.logger.info('Payment succeeded', {
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    functions.logger.error('No orderId in payment intent metadata');
    return;
  }

  const orderRef = db.collection('orders').doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    functions.logger.error('Order not found', { orderId });
    return;
  }

  const order = orderSnap.data();
  const failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';

  // Update order payment status
  await orderRef.update({
    'payment.status': 'failed',
    'payment.failureReason': failureReason,
    'payment.failedAt': new Date(),
    updatedAt: new Date(),
  });

  // Create notification for user
  await db.collection('notifications').add({
    userId: order?.userId,
    type: 'payment_failed',
    title: 'Échec du paiement',
    message: `Le paiement de votre commande #${order?.orderNumber} a échoué. Veuillez réessayer.`,
    data: {
      orderId,
      orderNumber: order?.orderNumber,
      failureReason,
    },
    read: false,
    createdAt: new Date(),
  });

  functions.logger.warn('Payment failed', {
    orderId,
    paymentIntentId: paymentIntent.id,
    failureReason,
  });
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    return;
  }

  const orderRef = db.collection('orders').doc(orderId);

  await orderRef.update({
    'payment.status': 'canceled',
    'payment.canceledAt': new Date(),
    updatedAt: new Date(),
  });

  functions.logger.info('Payment canceled', {
    orderId,
    paymentIntentId: paymentIntent.id,
  });
}

/**
 * Handle refund
 */
async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    return;
  }

  // Find order by payment intent ID
  const ordersSnap = await db
    .collection('orders')
    .where('payment.paymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get();

  if (ordersSnap.empty) {
    functions.logger.error('Order not found for refund', { paymentIntentId });
    return;
  }

  const orderDoc = ordersSnap.docs[0];
  const order = orderDoc.data();

  await orderDoc.ref.update({
    'payment.status': 'refunded',
    'payment.refundedAt': new Date(),
    'payment.refundAmount': charge.amount_refunded,
    status: 'refunded',
    updatedAt: new Date(),
  });

  // Create notification
  await db.collection('notifications').add({
    userId: order?.userId,
    type: 'payment_refunded',
    title: 'Remboursement effectué',
    message: `Un remboursement de ${charge.amount_refunded} FCFA a été effectué pour votre commande #${order?.orderNumber}`,
    data: {
      orderId: orderDoc.id,
      orderNumber: order?.orderNumber,
      refundAmount: charge.amount_refunded,
    },
    read: false,
    createdAt: new Date(),
  });

  functions.logger.info('Refund processed', {
    orderId: orderDoc.id,
    refundAmount: charge.amount_refunded,
  });
}
