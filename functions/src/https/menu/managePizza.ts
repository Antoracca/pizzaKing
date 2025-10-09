import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';
import { Pizza } from '@pizza-king/shared';

interface ManagePizzaRequest {
  action: 'create' | 'update' | 'delete' | 'toggle';
  pizzaId?: string;
  pizzaData?: Partial<Omit<Pizza, 'id'>>;
}

/**
 * Manage pizzas (Admin only)
 * Create, update, delete, or toggle availability
 */
export const managePizza = functions.https.onCall(
  async (data: ManagePizzaRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const userId = context.auth.uid;

    // Check if user is admin
    const db = admin.firestore();
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userRole = userDoc.data()?.role;

    if (!['admin', 'superadmin'].includes(userRole)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can manage pizzas'
      );
    }

    const { action, pizzaId, pizzaData } = data;

    try {
      switch (action) {
        case 'create': {
          if (!pizzaData) {
            throw new functions.https.HttpsError(
              'invalid-argument',
              'Pizza data is required'
            );
          }

          const newPizza = {
            ...pizzaData,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          };

          const docRef = await db.collection(COLLECTIONS.PIZZAS).add(newPizza);
          await docRef.update({ id: docRef.id });

          functions.logger.info(`Pizza created: ${docRef.id} by ${userId}`);

          return {
            success: true,
            pizzaId: docRef.id,
            message: 'Pizza created successfully',
          };
        }

        case 'update': {
          if (!pizzaId) {
            throw new functions.https.HttpsError(
              'invalid-argument',
              'Pizza ID is required'
            );
          }

          if (!pizzaData) {
            throw new functions.https.HttpsError(
              'invalid-argument',
              'Pizza data is required'
            );
          }

          await db
            .collection(COLLECTIONS.PIZZAS)
            .doc(pizzaId)
            .update({
              ...pizzaData,
              updatedAt: admin.firestore.Timestamp.now(),
            });

          functions.logger.info(`Pizza updated: ${pizzaId} by ${userId}`);

          return {
            success: true,
            message: 'Pizza updated successfully',
          };
        }

        case 'delete': {
          if (!pizzaId) {
            throw new functions.https.HttpsError(
              'invalid-argument',
              'Pizza ID is required'
            );
          }

          await db.collection(COLLECTIONS.PIZZAS).doc(pizzaId).delete();

          functions.logger.info(`Pizza deleted: ${pizzaId} by ${userId}`);

          return {
            success: true,
            message: 'Pizza deleted successfully',
          };
        }

        case 'toggle': {
          if (!pizzaId) {
            throw new functions.https.HttpsError(
              'invalid-argument',
              'Pizza ID is required'
            );
          }

          const pizzaDoc = await db
            .collection(COLLECTIONS.PIZZAS)
            .doc(pizzaId)
            .get();

          if (!pizzaDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Pizza not found');
          }

          const currentAvailability = pizzaDoc.data()?.isAvailable;

          await db
            .collection(COLLECTIONS.PIZZAS)
            .doc(pizzaId)
            .update({
              isAvailable: !currentAvailability,
              updatedAt: admin.firestore.Timestamp.now(),
            });

          functions.logger.info(
            `Pizza availability toggled: ${pizzaId} to ${!currentAvailability} by ${userId}`
          );

          return {
            success: true,
            isAvailable: !currentAvailability,
            message: 'Pizza availability toggled',
          };
        }

        default:
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Invalid action'
          );
      }
    } catch (error: any) {
      functions.logger.error('Error managing pizza:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error managing pizza',
        error.message
      );
    }
  }
);
