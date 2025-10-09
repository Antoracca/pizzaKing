import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';

interface GetMenuRequest {
  category?: string;
  onlyAvailable?: boolean;
}

/**
 * Get pizza menu
 */
export const getMenu = functions.https.onCall(
  async (data: GetMenuRequest = {}) => {
    const { category, onlyAvailable = true } = data;

    try {
      const db = admin.firestore();
      let query = db.collection(COLLECTIONS.PIZZAS);

      // Filter by category
      if (category) {
        query = query.where('category', '==', category) as any;
      }

      // Filter by availability
      if (onlyAvailable) {
        query = query.where('isAvailable', '==', true) as any;
      }

      // Order by rating
      query = query.orderBy('rating', 'desc') as any;

      const snapshot = await query.get();

      const pizzas = snapshot.docs.map(doc => doc.data());

      functions.logger.info(`Menu fetched: ${pizzas.length} pizzas`);

      return {
        success: true,
        pizzas,
        count: pizzas.length,
      };
    } catch (error: any) {
      functions.logger.error('Error getting menu:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error getting menu',
        error.message
      );
    }
  }
);
