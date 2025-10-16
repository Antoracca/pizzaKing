import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

const db = getFirestore();

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || '';
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || '';
const CINETPAY_API_BASE =
  process.env.CINETPAY_MODE === 'live'
    ? 'https://api.cinetpay.com/v2'
    : 'https://api-checkout.cinetpay.com/v2';

/**
 * Handle Mobile Money payment callback from Cinetpay
 *
 * This endpoint receives notifications from Cinetpay when payment status changes
 */
export const handleMobileMoneyCallback = functions.https.onRequest(
  async (req, res) => {
    functions.logger.info('Mobile Money callback received', { body: req.body });

    const { transaction_id, cpm_trans_id } = req.body;

    if (!transaction_id) {
      functions.logger.error('Missing transaction_id in callback');
      res.status(400).send('Missing transaction_id');
      return;
    }

    try {
      // Verify payment status with Cinetpay
      const statusResponse = await axios.post(
        `${CINETPAY_API_BASE}/payment/check`,
        {
          apikey: CINETPAY_API_KEY,
          site_id: CINETPAY_SITE_ID,
          transaction_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const paymentStatus = statusResponse.data;

      if (paymentStatus.code !== '00') {
        functions.logger.error('Payment status check failed', {
          code: paymentStatus.code,
          message: paymentStatus.message,
        });
        res.status(400).send('Payment verification failed');
        return;
      }

      const metadata = JSON.parse(paymentStatus.data.metadata || '{}');
      const orderId = metadata.orderId;

      if (!orderId) {
        functions.logger.error('No orderId in payment metadata');
        res.status(400).send('Invalid payment metadata');
        return;
      }

      // Get order
      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        functions.logger.error('Order not found', { orderId });
        res.status(404).send('Order not found');
        return;
      }

      const order = orderSnap.data();

      // Handle different payment statuses
      const status = paymentStatus.data.payment_status;

      if (status === 'ACCEPTED' || status === 'PAID') {
        // Payment successful
        await orderRef.update({
          'payment.status': 'succeeded',
          'payment.cinetpayTransId': cpm_trans_id,
          'payment.paidAt': new Date(),
          'payment.paymentMethod': paymentStatus.data.payment_method,
          'payment.operatorId': paymentStatus.data.operator_id,
          status: 'confirmed',
          updatedAt: new Date(),
        });

        // Create success notification
        await db.collection('notifications').add({
          userId: order?.userId,
          type: 'payment_success',
          title: 'Paiement Mobile Money réussi',
          message: `Votre paiement de ${paymentStatus.data.amount} FCFA a été confirmé. Commande #${order?.orderNumber}`,
          data: {
            orderId,
            orderNumber: order?.orderNumber,
            transactionId: transaction_id,
          },
          read: false,
          createdAt: new Date(),
        });

        functions.logger.info('Mobile Money payment succeeded', {
          orderId,
          transactionId: transaction_id,
          amount: paymentStatus.data.amount,
        });
      } else if (status === 'REFUSED' || status === 'FAILED') {
        // Payment failed
        await orderRef.update({
          'payment.status': 'failed',
          'payment.failureReason':
            paymentStatus.data.description || 'Payment refused',
          'payment.failedAt': new Date(),
          updatedAt: new Date(),
        });

        // Create failure notification
        await db.collection('notifications').add({
          userId: order?.userId,
          type: 'payment_failed',
          title: 'Échec du paiement Mobile Money',
          message: `Le paiement de votre commande #${order?.orderNumber} a échoué. Veuillez réessayer.`,
          data: {
            orderId,
            orderNumber: order?.orderNumber,
            reason: paymentStatus.data.description,
          },
          read: false,
          createdAt: new Date(),
        });

        functions.logger.warn('Mobile Money payment failed', {
          orderId,
          transactionId: transaction_id,
          reason: paymentStatus.data.description,
        });
      } else {
        // Payment pending or other status
        await orderRef.update({
          'payment.status': status.toLowerCase(),
          'payment.lastCheckedAt': new Date(),
          updatedAt: new Date(),
        });

        functions.logger.info('Mobile Money payment status updated', {
          orderId,
          transactionId: transaction_id,
          status,
        });
      }

      res.status(200).send('OK');
    } catch (error: any) {
      functions.logger.error('Error handling mobile money callback', {
        error: error.message,
        transactionId: transaction_id,
      });
      res.status(500).send('Internal server error');
    }
  }
);
