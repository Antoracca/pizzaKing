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
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'deleted'
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Update profile image
   */
  async updateProfileImage(userId: string, imageUrl: string): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      photoURL: imageUrl,
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
