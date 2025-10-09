import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';

/**
 * Expire old promotions
 * Runs every day at midnight (Africa/Ouagadougou timezone)
 */
export const expirePromotions = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Africa/Ouagadougou')
  .onRun(async context => {
    functions.logger.info('Running promotion expiration check');

    const db = admin.firestore();

    try {
      const now = admin.firestore.Timestamp.now();

      // Get expired promotions that are still active
      const expiredPromosSnapshot = await db
        .collection(COLLECTIONS.PROMOTIONS)
        .where('endDate', '<', now)
        .where('isActive', '==', true)
        .get();

      if (expiredPromosSnapshot.empty) {
        functions.logger.info('No expired promotions found');
        return null;
      }

      // Deactivate expired promotions
      const batch = db.batch();
      let count = 0;

      expiredPromosSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isActive: false,
          updatedAt: admin.firestore.Timestamp.now(),
        });
        count++;
      });

      await batch.commit();

      functions.logger.info(`${count} expired promotions deactivated`);

      return null;
    } catch (error) {
      functions.logger.error('Error expiring promotions:', error);
      return null;
    }
  });
