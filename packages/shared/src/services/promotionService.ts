import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Firestore,
  Timestamp,
} from 'firebase/firestore';
import { Promotion } from '../types/promotion';
import { COLLECTIONS } from '../constants/collections';

/**
 * Promotion Service - CRUD operations for promotions and promo codes
 */
export class PromotionService {
  constructor(private db: Firestore) {}

  /**
   * Get promotion by ID
   */
  async getPromotionById(id: string): Promise<Promotion | null> {
    const docRef = doc(this.db, COLLECTIONS.PROMOTIONS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Promotion;
    }

    return null;
  }

  /**
   * Get promotion by code
   */
  async getPromotionByCode(code: string): Promise<Promotion | null> {
    const q = query(
      collection(this.db, COLLECTIONS.PROMOTIONS),
      where('code', '==', code.toUpperCase())
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as Promotion;
  }

  /**
   * Get all active promotions
   */
  async getActivePromotions(): Promise<Promotion[]> {
    const now = Timestamp.now();

    const q = query(
      collection(this.db, COLLECTIONS.PROMOTIONS),
      where('isActive', '==', true),
      where('startDate', '<=', now),
      where('endDate', '>=', now),
      orderBy('startDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Promotion);
  }

  /**
   * Validate promo code
   */
  async validatePromoCode(
    code: string,
    userId: string,
    orderAmount: number,
    userLoyaltyPoints?: number,
    isFirstOrder?: boolean
  ): Promise<{
    valid: boolean;
    error?: string;
    promotion?: Promotion;
    discountAmount?: number;
  }> {
    const promotion = await this.getPromotionByCode(code);

    if (!promotion) {
      return { valid: false, error: 'Code promo invalide' };
    }

    if (!promotion.isActive) {
      return { valid: false, error: 'Code promo inactif' };
    }

    const now = Date.now();
    const startDate = promotion.startDate.toDate().getTime();
    const endDate = promotion.endDate.toDate().getTime();

    if (now < startDate || now > endDate) {
      return { valid: false, error: 'Code promo expiré' };
    }

    if (
      promotion.maxTotalUses &&
      promotion.currentUses >= promotion.maxTotalUses
    ) {
      return { valid: false, error: 'Code promo épuisé' };
    }

    if (orderAmount < (promotion.minOrderAmount || 0)) {
      return {
        valid: false,
        error: `Montant minimum de commande: ${promotion.minOrderAmount} FCFA`,
      };
    }

    if (promotion.firstOrderOnly && !isFirstOrder) {
      return {
        valid: false,
        error: 'Code promo réservé aux premières commandes',
      };
    }

    // Calculate discount
    let discountAmount = 0;

    if (promotion.discountType === 'percentage') {
      discountAmount = (orderAmount * promotion.discountValue) / 100;

      if (promotion.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount);
      }
    } else {
      discountAmount = promotion.discountValue;
    }

    return {
      valid: true,
      promotion,
      discountAmount: Math.round(discountAmount),
    };
  }

  /**
   * Increment promotion usage
   */
  async incrementUsage(promotionId: string): Promise<void> {
    const promotion = await this.getPromotionById(promotionId);
    if (!promotion) throw new Error('Promotion not found');

    const docRef = doc(this.db, COLLECTIONS.PROMOTIONS, promotionId);
    await updateDoc(docRef, {
      currentUses: promotion.currentUses + 1,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Create new promotion (Admin only)
   */
  async createPromotion(
    promotion: Omit<Promotion, 'id' | 'currentUses' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(this.db, COLLECTIONS.PROMOTIONS), {
      ...promotion,
      code: promotion.code.toUpperCase(),
      currentUses: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update with ID
    await updateDoc(docRef, { id: docRef.id });

    return docRef.id;
  }

  /**
   * Update promotion (Admin only)
   */
  async updatePromotion(
    id: string,
    updates: Partial<Omit<Promotion, 'id' | 'createdAt'>>
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.PROMOTIONS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Delete promotion (Admin only)
   */
  async deletePromotion(id: string): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.PROMOTIONS, id);
    await deleteDoc(docRef);
  }

  /**
   * Activate/Deactivate promotion (Admin only)
   */
  async togglePromotionStatus(id: string, isActive: boolean): Promise<void> {
    await this.updatePromotion(id, { isActive });
  }

  /**
   * Get expired promotions
   */
  async getExpiredPromotions(): Promise<Promotion[]> {
    const now = Timestamp.now();

    const q = query(
      collection(this.db, COLLECTIONS.PROMOTIONS),
      where('endDate', '<', now),
      orderBy('endDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Promotion);
  }

  /**
   * Get promotion statistics
   */
  async getPromotionStatistics(promotionId: string): Promise<{
    usageCount: number;
    remainingUses: number;
    usagePercentage: number;
    isExpired: boolean;
    daysRemaining: number;
  }> {
    const promotion = await this.getPromotionById(promotionId);

    if (!promotion) {
      throw new Error('Promotion not found');
    }

    const maxUses = promotion.maxTotalUses || Infinity;
    const remainingUses =
      maxUses === Infinity ? Infinity : maxUses - promotion.currentUses;
    const usagePercentage =
      maxUses === Infinity ? 0 : (promotion.currentUses / maxUses) * 100;

    const now = Date.now();
    const endDate = promotion.endDate.toDate().getTime();
    const isExpired = now > endDate;

    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    return {
      usageCount: promotion.currentUses,
      remainingUses:
        remainingUses === Infinity ? 999999 : Math.max(0, remainingUses),
      usagePercentage: Math.min(100, usagePercentage),
      isExpired,
      daysRemaining: Math.max(0, daysRemaining),
    };
  }
}
