import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';
import { OrderStatus } from '@pizza-king/shared';

/**
 * Triggered when an order is updated
 * Handles side effects like notifications and analytics
 */
export const onOrderUpdate = functions.firestore
  .document(`${COLLECTIONS.ORDERS}/{orderId}`)
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    functions.logger.info(`Order updated: ${orderId}`);

    const db = admin.firestore();

    try {
      // Status changed
      if (before.status !== after.status) {
        const newStatus = after.status as OrderStatus;

        functions.logger.info(
          `Order ${orderId} status changed: ${before.status} -> ${newStatus}`
        );

        // Update deliverer stats when order is delivered
        if (newStatus === 'delivered' && after.delivererId) {
          const delivererRef = db
            .collection(COLLECTIONS.USERS)
            .doc(after.delivererId);

          await delivererRef.update({
            'delivererInfo.deliveryCount':
              admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.Timestamp.now(),
          });

          functions.logger.info(
            `Deliverer ${after.delivererId} stats updated for order ${orderId}`
          );
        }

        // Refund promo code usage if order is cancelled
        if (newStatus === 'cancelled' && after.pricing?.promoCode) {
          const promoCode = after.pricing.promoCode.code;
          const promoSnapshot = await db
            .collection(COLLECTIONS.PROMOTIONS)
            .where('code', '==', promoCode)
            .limit(1)
            .get();

          if (!promoSnapshot.empty) {
            await promoSnapshot.docs[0].ref.update({
              usageCount: admin.firestore.FieldValue.increment(-1),
            });

            functions.logger.info(
              `Promo code ${promoCode} refunded for cancelled order ${orderId}`
            );
          }
        }
      }

      // Deliverer assigned
      if (!before.delivererId && after.delivererId) {
        functions.logger.info(
          `Deliverer ${after.delivererId} assigned to order ${orderId}`
        );

        // Notify deliverer
        await db.collection(COLLECTIONS.NOTIFICATIONS).add({
          userId: after.delivererId,
          type: 'order_assigned',
          title: 'Nouvelle livraison ! 🚚',
          body: `Commande ${after.orderNumber} vous a été assignée.`,
          isRead: false,
          data: { orderId },
          createdAt: admin.firestore.Timestamp.now(),
        });

        // Update deliverer availability
        await db
          .collection(COLLECTIONS.USERS)
          .doc(after.delivererId)
          .update({
            'delivererInfo.isAvailable': false,
          });
      }

      // Order completed (delivered)
      if (before.status !== 'delivered' && after.status === 'delivered') {
        // Make deliverer available again
        if (after.delivererId) {
          await db
            .collection(COLLECTIONS.USERS)
            .doc(after.delivererId)
            .update({
              'delivererInfo.isAvailable': true,
            });
        }

        functions.logger.info(`Order ${orderId} delivered successfully`);
      }

      return null;
    } catch (error) {
      functions.logger.error('Error in onOrderUpdate:', error);
      return null;
    }
  });
