import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';

interface GetOrderByIdRequest {
  orderId: string;
}

/**
 * Get order by ID
 */
export const getOrderById = functions.https.onCall(
  async (data: GetOrderByIdRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { orderId } = data;

    if (!orderId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order ID is required'
      );
    }

    try {
      const db = admin.firestore();
      const userId = context.auth.uid;

      // Get order
      const orderDoc = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();

      if (!orderDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Order not found');
      }

      const order = orderDoc.data();

      // Get user role
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
      const userRole = userDoc.data()?.role;

      // Check permissions
      const isAdmin = ['admin', 'superadmin'].includes(userRole);
      const isDeliverer = userRole === 'deliverer' && order?.delivererId === userId;
      const isOwner = order?.userId === userId;

      if (!isAdmin && !isDeliverer && !isOwner) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to view this order'
        );
      }

      return {
        success: true,
        order,
      };
    } catch (error: any) {
      functions.logger.error('Error getting order:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error getting order',
        error.message
      );
    }
  }
);
