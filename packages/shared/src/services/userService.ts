import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  limit,
  Firestore,
  Timestamp,
} from 'firebase/firestore';
import { User, UserRole } from '../types/user';
import { COLLECTIONS } from '../constants/collections';

/**
 * User Service - CRUD operations for users
 */
export class UserService {
  constructor(private db: Firestore) {}

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const docRef = doc(this.db, COLLECTIONS.USERS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as User;
    }

    return null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(
      collection(this.db, COLLECTIONS.USERS),
      where('email', '==', email),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as User;
  }

  /**
   * Get user by phone number
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const q = query(
      collection(this.db, COLLECTIONS.USERS),
      where('phoneNumber', '==', phoneNumber),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as User;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Update user loyalty points
   */
  async updateLoyaltyPoints(
    userId: string,
    points: number,
    operation: 'add' | 'subtract' | 'set'
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    let newPoints: number;

    switch (operation) {
      case 'add':
        newPoints = user.loyaltyPoints + points;
        break;
      case 'subtract':
        newPoints = Math.max(0, user.loyaltyPoints - points);
        break;
      case 'set':
        newPoints = points;
        break;
    }

    const docRef = doc(this.db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      loyaltyPoints: newPoints,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<User['preferences']>
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const docRef = doc(this.db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      preferences: {
        ...user.preferences,
        ...preferences,
      },
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<User[]> {
    const q = query(
      collection(this.db, COLLECTIONS.USERS),
      where('role', '==', role)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  }

  /**
   * Get available deliverers
   */
  async getAvailableDeliverers(): Promise<User[]> {
    const q = query(
      collection(this.db, COLLECTIONS.USERS),
      where('role', '==', 'deliverer'),
      where('delivererInfo.isAvailable', '==', true)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  }

  /**
   * Update deliverer availability
   */
  async updateDelivererAvailability(
    delivererId: string,
    isAvailable: boolean
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.USERS, delivererId);
    await updateDoc(docRef, {
      'delivererInfo.isAvailable': isAvailable,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Update deliverer location
   */
  async updateDelivererLocation(
    delivererId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.USERS, delivererId);
    await updateDoc(docRef, {
      'delivererInfo.currentLocation': {
        latitude,
        longitude,
        accuracy: 10,
        timestamp: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Increment deliverer stats
   */
  async incrementDelivererStats(
    delivererId: string,
    newRating?: number
  ): Promise<void> {
    const user = await this.getUserById(delivererId);
    if (!user || !user.delivererInfo) {
      throw new Error('Deliverer not found');
    }

    const deliveryCount = user.delivererInfo.deliveryCount + 1;
    let rating = user.delivererInfo.rating;

    if (newRating) {
      // Calculate new average rating
      const totalRating = user.delivererInfo.rating * user.delivererInfo.deliveryCount;
      rating = (totalRating + newRating) / deliveryCount;
    }

    const docRef = doc(this.db, COLLECTIONS.USERS, delivererId);
    await updateDoc(docRef, {
      'delivererInfo.deliveryCount': deliveryCount,
      'delivererInfo.rating': rating,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      isEmailVerified: true,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Verify user phone
   */
  async verifyPhone(userId: string): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      isPhoneVerified: true,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Update profile image
   */
  async updateProfileImage(userId: string, imageUrl: string): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      profileImage: imageUrl,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    favoriteItems: string[];
  }> {
    // This would typically involve querying orders
    // For now, return basic info from user profile
    const user = await this.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      totalOrders: 0, // Would be calculated from orders collection
      totalSpent: 0, // Would be calculated from orders collection
      loyaltyPoints: user.loyaltyPoints,
      favoriteItems: [], // Would be calculated from order history
    };
  }
}
