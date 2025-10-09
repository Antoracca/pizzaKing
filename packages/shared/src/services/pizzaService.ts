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
  limit,
  Firestore,
  QueryConstraint,
} from 'firebase/firestore';
import { Pizza, PizzaCategory } from '../types/pizza';
import { COLLECTIONS } from '../constants/collections';

/**
 * Pizza Service - CRUD operations for pizzas
 */
export class PizzaService {
  constructor(private db: Firestore) {}

  /**
   * Get all pizzas
   */
  async getAllPizzas(options?: {
    category?: PizzaCategory;
    onlyAvailable?: boolean;
    orderByField?: 'name' | 'basePrice' | 'rating' | 'createdAt';
    limitCount?: number;
  }): Promise<Pizza[]> {
    const constraints: QueryConstraint[] = [];

    if (options?.category) {
      constraints.push(where('category', '==', options.category));
    }

    if (options?.onlyAvailable) {
      constraints.push(where('isAvailable', '==', true));
    }

    if (options?.orderByField) {
      constraints.push(orderBy(options.orderByField, 'asc'));
    }

    if (options?.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    const q = query(collection(this.db, COLLECTIONS.PIZZAS), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as Pizza);
  }

  /**
   * Get pizza by ID
   */
  async getPizzaById(id: string): Promise<Pizza | null> {
    const docRef = doc(this.db, COLLECTIONS.PIZZAS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Pizza;
    }

    return null;
  }

  /**
   * Get pizza by slug
   */
  async getPizzaBySlug(slug: string): Promise<Pizza | null> {
    const q = query(
      collection(this.db, COLLECTIONS.PIZZAS),
      where('slug', '==', slug),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as Pizza;
  }

  /**
   * Search pizzas by name
   */
  async searchPizzas(searchTerm: string): Promise<Pizza[]> {
    const allPizzas = await this.getAllPizzas({ onlyAvailable: true });

    const searchLower = searchTerm.toLowerCase();
    return allPizzas.filter(
      pizza =>
        pizza.name.toLowerCase().includes(searchLower) ||
        pizza.description.toLowerCase().includes(searchLower) ||
        pizza.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Get pizzas by category
   */
  async getPizzasByCategory(category: PizzaCategory): Promise<Pizza[]> {
    return this.getAllPizzas({ category, onlyAvailable: true });
  }

  /**
   * Get popular pizzas (by rating)
   */
  async getPopularPizzas(limitCount: number = 6): Promise<Pizza[]> {
    return this.getAllPizzas({
      onlyAvailable: true,
      orderByField: 'rating',
      limitCount,
    });
  }

  /**
   * Create new pizza (Admin only)
   */
  async createPizza(pizza: Omit<Pizza, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.db, COLLECTIONS.PIZZAS), {
      ...pizza,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update with ID
    await updateDoc(docRef, { id: docRef.id });

    return docRef.id;
  }

  /**
   * Update pizza (Admin only)
   */
  async updatePizza(
    id: string,
    updates: Partial<Omit<Pizza, 'id' | 'createdAt'>>
  ): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.PIZZAS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete pizza (Admin only)
   */
  async deletePizza(id: string): Promise<void> {
    const docRef = doc(this.db, COLLECTIONS.PIZZAS, id);
    await deleteDoc(docRef);
  }

  /**
   * Toggle pizza availability (Admin only)
   */
  async toggleAvailability(id: string, isAvailable: boolean): Promise<void> {
    await this.updatePizza(id, { isAvailable });
  }

  /**
   * Update pizza rating
   */
  async updateRating(
    id: string,
    newRating: number,
    reviewCount: number
  ): Promise<void> {
    await this.updatePizza(id, {
      rating: newRating,
      reviewCount,
    });
  }

  /**
   * Get vegetarian pizzas
   */
  async getVegetarianPizzas(): Promise<Pizza[]> {
    const q = query(
      collection(this.db, COLLECTIONS.PIZZAS),
      where('isVegetarian', '==', true),
      where('isAvailable', '==', true)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Pizza);
  }

  /**
   * Get spicy pizzas
   */
  async getSpicyPizzas(): Promise<Pizza[]> {
    const q = query(
      collection(this.db, COLLECTIONS.PIZZAS),
      where('isSpicy', '==', true),
      where('isAvailable', '==', true)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Pizza);
  }
}
