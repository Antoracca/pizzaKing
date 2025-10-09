import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Firestore,
  Timestamp,
} from 'firebase/firestore';
import { Order, OrderStatus } from '../types/order';
import { COLLECTIONS } from '../constants/collections';

/**
 * Order Service - CRUD operations for orders
 */
export class OrderService {
  constructor(private db: Firestore) {}

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    const docRef = doc(this.db, COLLECTIONS.ORDERS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Order;
    }

    return null;
  }

  /**
   * Get orders by user ID
   */
  async getOrdersByUserId(
    userId: string,
    limitCount: number = 20
  ): Promise<Order[]> {
    const q = query(
      collection(this.db, COLLECTIONS.ORDERS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Order);
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    status: OrderStatus,
    limitCount: number = 50
  ): Promise<Order[]> {
    const q = query(
      collection(this.db, COLLECTIONS.ORDERS),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Order);
  }

  /**
   * Get orders by deliverer ID
   */
  async getOrdersByDelivererId(
    delivererId: string,
    limitCount: number = 20
  ): Promise<Order[]> {
    const q = query(
      collection(this.db, COLLECTIONS.ORDERS),
      where('delivererId', '==', delivererId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Order);
  }

  /**
   * Get active orders (pending, confirmed, preparing, on_route)
   */
  async getActiveOrders(): Promise<Order[]> {
    const activeStatuses: OrderStatus[] = [
      'pending',
      'confirmed',
      'preparing',
      'on_route',
    ];

    const q = query(
      collection(this.db, COLLECTIONS.ORDERS),
      where('status', 'in', activeStatuses),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Order);
  }

  /**
   * Create new order
   */
  async createOrder(order: Omit<Order, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.db, COLLECTIONS.ORDERS), {
      ...order,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update with ID
    await updateDoc(docRef, { id: docRef.id });

    return docRef.id;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    additionalData?: Partial<Order>
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.ORDERS, id);

    const updates: any = {
      status,
      updatedAt: Timestamp.now(),
      ...additionalData,
    };

    // Add timestamp for specific statuses
    if (status === 'confirmed') {
      updates.confirmedAt = Timestamp.now();
    } else if (status === 'preparing') {
      updates.preparingAt = Timestamp.now();
    } else if (status === 'on_route') {
      updates.onRouteAt = Timestamp.now();
    } else if (status === 'delivered') {
      updates.deliveredAt = Timestamp.now();
    } else if (status === 'cancelled') {
      updates.cancelledAt = Timestamp.now();
    }

    await updateDoc(docRef, updates);
  }

  /**
   * Assign deliverer to order
   */
  async assignDeliverer(orderId: string, delivererId: string): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(docRef, {
      delivererId,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Update delivery location
   */
  async updateDeliveryLocation(
    orderId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(docRef, {
      'delivery.currentLocation': {
        latitude,
        longitude,
        accuracy: 10,
        timestamp: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Update estimated delivery time
   */
  async updateEstimatedDeliveryTime(
    orderId: string,
    estimatedDeliveryTime: Date
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(docRef, {
      'delivery.estimatedDeliveryTime': Timestamp.fromDate(
        estimatedDeliveryTime
      ),
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    orderId: string,
    reason: string,
    cancelledBy: 'customer' | 'admin'
  ): Promise<void> {
    await this.updateOrderStatus(orderId, 'cancelled', {
      cancellationReason: reason,
      cancelledBy,
    });
  }

  /**
   * Get today's orders
   */
  async getTodaysOrders(): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(this.db, COLLECTIONS.ORDERS),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Order);
  }

  /**
   * Get orders count by status
   */
  async getOrdersCountByStatus(status: OrderStatus): Promise<number> {
    const orders = await this.getOrdersByStatus(status, 1000);
    return orders.length;
  }

  /**
   * Get user's order history
   */
  async getUserOrderHistory(userId: string): Promise<Order[]> {
    const q = query(
      collection(this.db, COLLECTIONS.ORDERS),
      where('userId', '==', userId),
      where('status', 'in', ['delivered', 'cancelled']),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Order);
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
  }> {
    let orders: Order[];

    if (startDate && endDate) {
      const q = query(
        collection(this.db, COLLECTIONS.ORDERS),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );
      const querySnapshot = await getDocs(q);
      orders = querySnapshot.docs.map(doc => doc.data() as Order);
    } else {
      const querySnapshot = await getDocs(
        collection(this.db, COLLECTIONS.ORDERS)
      );
      orders = querySnapshot.docs.map(doc => doc.data() as Order);
    }

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.pricing.total,
      0
    );

    const ordersByStatus: Record<OrderStatus, number> = {
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

    return {
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      ordersByStatus,
    };
  }
}
