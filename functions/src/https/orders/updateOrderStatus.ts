import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';
import { OrderStatus } from '@pizza-king/shared';

interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  delivererId?: string;
  cancellationReason?: string;
}

/**
 * Update order status (Admin/Deliverer only)
 */
export const updateOrderStatus = functions.https.onCall(
  async (data: UpdateOrderStatusRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { orderId, status, delivererId, cancellationReason } = data;

    if (!orderId || !status) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order ID and status are required'
      );
    }

    try {
      const db = admin.firestore();
      const userId = context.auth.uid;

      // Get user role
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
      const userRole = userDoc.data()?.role;

      // Check permissions
      if (
        !['admin', 'superadmin', 'deliverer'].includes(userRole) &&
        status !== 'cancelled'
      ) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Insufficient permissions to update order status'
        );
      }

      // Get order
      const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Order not found');
      }

      const order = orderDoc.data();

      // If customer is cancelling, verify ownership
      if (status === 'cancelled' && userRole === 'customer') {
        if (order?.userId !== userId) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'You can only cancel your own orders'
          );
        }
        // Only allow cancellation if order is pending or confirmed
        if (!['pending', 'confirmed'].includes(order?.status)) {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'Order cannot be cancelled at this stage'
          );
        }
      }

      // Update order
      const updates: any = {
        status,
        updatedAt: admin.firestore.Timestamp.now(),
      };

      // Add timestamp for specific statuses
      if (status === 'confirmed') {
        updates.confirmedAt = admin.firestore.Timestamp.now();
      } else if (status === 'preparing') {
        updates.preparingAt = admin.firestore.Timestamp.now();
      } else if (status === 'on_route') {
        updates.onRouteAt = admin.firestore.Timestamp.now();
        if (delivererId) {
          updates.delivererId = delivererId;
        }
      } else if (status === 'delivered') {
        updates.deliveredAt = admin.firestore.Timestamp.now();
      } else if (status === 'cancelled') {
        updates.cancelledAt = admin.firestore.Timestamp.now();
        updates.cancellationReason = cancellationReason || 'No reason provided';
        updates.cancelledBy = userRole;

        // Refund loyalty points if order was paid
        if (order?.payment?.status === 'paid') {
          const pointsToRefund = Math.floor(order.pricing.total / 100);
          await db
            .collection(COLLECTIONS.USERS)
            .doc(order.userId)
            .update({
              loyaltyPoints: admin.firestore.FieldValue.increment(-pointsToRefund),
            });
        }
      }

      await orderRef.update(updates);

      functions.logger.info(
        `Order ${orderId} status updated to ${status} by ${userId}`
      );

      // Create notification for customer
      const notificationMessages: Record<OrderStatus, string> = {
        pending: 'Commande en attente de confirmation',
        confirmed: 'Commande confirmée ! Préparation en cours.',
        preparing: 'Votre pizza est en cours de préparation 👨‍🍳',
        on_route: 'Votre commande est en route ! 🚚',
        delivered: 'Commande livrée ! Bon appétit ! 🍕',
        cancelled: 'Commande annulée',
      };

      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        userId: order?.userId,
        type: `order_${status}`,
        title: `Commande ${order?.orderNumber}`,
        body: notificationMessages[status],
        isRead: false,
        data: { orderId },
        createdAt: admin.firestore.Timestamp.now(),
      });

      return {
        success: true,
        message: `Order status updated to ${status}`,
      };
    } catch (error: any) {
      functions.logger.error('Error updating order status:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error updating order status',
        error.message
      );
    }
  }
);
