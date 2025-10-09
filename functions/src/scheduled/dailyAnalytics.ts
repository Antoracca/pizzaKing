import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';

/**
 * Generate daily analytics report
 * Runs every day at midnight (Africa/Ouagadougou timezone)
 */
export const dailyAnalytics = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Africa/Ouagadougou')
  .onRun(async context => {
    functions.logger.info('Running daily analytics');

    const db = admin.firestore();

    try {
      // Get yesterday's date range
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);

      // Get orders from yesterday
      const ordersSnapshot = await db
        .collection(COLLECTIONS.ORDERS)
        .where(
          'createdAt',
          '>=',
          admin.firestore.Timestamp.fromDate(yesterday)
        )
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(today))
        .get();

      const orders = ordersSnapshot.docs.map(doc => doc.data());

      // Calculate statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const ordersByStatus = {
        pending: 0,
        confirmed: 0,
        preparing: 0,
        on_route: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders.forEach(order => {
        ordersByStatus[order.status]++;
      });

      const completionRate =
        totalOrders > 0 ? (ordersByStatus.delivered / totalOrders) * 100 : 0;

      const analytics = {
        date: admin.firestore.Timestamp.fromDate(yesterday),
        totalOrders,
        totalRevenue,
        averageOrderValue: Math.round(averageOrderValue),
        ordersByStatus,
        completionRate: Math.round(completionRate * 100) / 100,
        createdAt: admin.firestore.Timestamp.now(),
      };

      // Save analytics
      await db.collection('analytics').add(analytics);

      functions.logger.info('Daily analytics saved:', analytics);

      // Get all admins
      const adminsSnapshot = await db
        .collection(COLLECTIONS.USERS)
        .where('role', 'in', ['admin', 'superadmin'])
        .get();

      // Send notification to each admin
      const notificationPromises = adminsSnapshot.docs.map(adminDoc =>
        db.collection(COLLECTIONS.NOTIFICATIONS).add({
          userId: adminDoc.id,
          type: 'analytics',
          title: 'Rapport journalier 📊',
          body: `${totalOrders} commandes | ${totalRevenue.toLocaleString()} FCFA | ${completionRate.toFixed(1)}% livrées`,
          isRead: false,
          data: analytics,
          createdAt: admin.firestore.Timestamp.now(),
        })
      );

      await Promise.all(notificationPromises);

      functions.logger.info('Daily analytics notifications sent to admins');

      return null;
    } catch (error) {
      functions.logger.error('Error generating daily analytics:', error);
      return null;
    }
  });
