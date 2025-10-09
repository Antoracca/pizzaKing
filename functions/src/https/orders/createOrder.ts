import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';
import { Order } from '@pizza-king/shared';

interface CreateOrderRequest {
  items: Order['items'];
  deliveryAddress: Order['delivery']['address'];
  deliveryInstructions?: string;
  paymentMethod: Order['payment']['method'];
  promoCode?: string;
}

/**
 * Create a new order
 */
export const createOrder = functions.https.onCall(
  async (data: CreateOrderRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const userId = context.auth.uid;

    const { items, deliveryAddress, deliveryInstructions, paymentMethod, promoCode } = data;

    // Validate items
    if (!items || items.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Order must contain at least one item'
      );
    }

    // Validate delivery address
    if (!deliveryAddress || !deliveryAddress.street) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Valid delivery address is required'
      );
    }

    try {
      const db = admin.firestore();

      // Calculate subtotal
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.totalPrice;
      }

      // Apply promo code if provided
      let discount = 0;
      let promoCodeApplied = null;

      if (promoCode) {
        const promoSnapshot = await db
          .collection(COLLECTIONS.PROMOTIONS)
          .where('code', '==', promoCode.toUpperCase())
          .where('isActive', '==', true)
          .limit(1)
          .get();

        if (!promoSnapshot.empty) {
          const promo = promoSnapshot.docs[0].data();
          const now = admin.firestore.Timestamp.now();

          if (
            promo.startDate <= now &&
            promo.endDate >= now &&
            promo.usageCount < promo.usageLimit &&
            subtotal >= (promo.minOrderAmount || 0)
          ) {
            if (promo.discountType === 'percentage') {
              discount = (subtotal * promo.discountValue) / 100;
              if (promo.maxDiscountAmount) {
                discount = Math.min(discount, promo.maxDiscountAmount);
              }
            } else {
              discount = promo.discountValue;
            }

            promoCodeApplied = {
              code: promo.code,
              discountAmount: Math.round(discount),
            };

            // Increment promo usage
            await promoSnapshot.docs[0].ref.update({
              usageCount: admin.firestore.FieldValue.increment(1),
            });
          }
        }
      }

      // Calculate totals
      const deliveryFee = 1000; // 1000 FCFA
      const tax = Math.round((subtotal - discount) * 0.18); // 18% tax
      const total = subtotal - discount + deliveryFee + tax;

      // Generate order number
      const orderNumber = `PK${Date.now().toString().slice(-8)}`;

      // Create order document
      const orderData: Omit<Order, 'id'> = {
        orderNumber,
        userId,
        status: 'pending',
        items,
        delivery: {
          address: deliveryAddress,
          instructions: deliveryInstructions,
          fee: deliveryFee,
          estimatedDeliveryTime: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 45 * 60 * 1000) // +45 minutes
          ),
        },
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cash' ? 'pending' : 'unpaid',
        },
        pricing: {
          subtotal,
          discount,
          deliveryFee,
          tax,
          total,
          promoCode: promoCodeApplied,
        },
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      const orderRef = await db.collection(COLLECTIONS.ORDERS).add(orderData);

      // Update order with ID
      await orderRef.update({ id: orderRef.id });

      functions.logger.info(`Order created: ${orderRef.id} by user ${userId}`);

      // Award loyalty points (1 point per 100 FCFA)
      const pointsEarned = Math.floor(total / 100);
      await db
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .update({
          loyaltyPoints: admin.firestore.FieldValue.increment(pointsEarned),
        });

      // Create loyalty transaction
      await db.collection(COLLECTIONS.LOYALTY_TRANSACTIONS).add({
        userId,
        orderId: orderRef.id,
        type: 'earned',
        points: pointsEarned,
        description: `Points gagnés pour la commande ${orderNumber}`,
        createdAt: admin.firestore.Timestamp.now(),
      });

      // Create notification
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        userId,
        type: 'order_created',
        title: 'Commande confirmée ! 🎉',
        body: `Votre commande ${orderNumber} a été reçue. Temps estimé: 45 min.`,
        isRead: false,
        data: { orderId: orderRef.id },
        createdAt: admin.firestore.Timestamp.now(),
      });

      return {
        success: true,
        orderId: orderRef.id,
        orderNumber,
        total,
        pointsEarned,
        message: 'Order created successfully',
      };
    } catch (error: any) {
      functions.logger.error('Error creating order:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error creating order',
        error.message
      );
    }
  }
);
