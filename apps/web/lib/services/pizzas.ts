'use client';

import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Pizza {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  isSpicy: boolean;
  isVegetarian: boolean;
  isBestSeller: boolean;
  prepTime: string;
  loves: number;
  category?: string;
  available?: boolean;
}

/**
 * Récupère toutes les pizzas depuis Firebase
 */
export async function getPizzas(): Promise<Pizza[]> {
  try {
    const pizzasRef = collection(db, 'pizzas');
    const q = query(pizzasRef, orderBy('isBestSeller', 'desc'), orderBy('rating', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Pizza[];
  } catch (error) {
    console.error('Error fetching pizzas:', error);
    return [];
  }
}

/**
 * Récupère les pizzas best-sellers (max 12)
 */
export async function getBestSellerPizzas(maxCount: number = 12): Promise<Pizza[]> {
  try {
    const pizzasRef = collection(db, 'pizzas');
    const q = query(
      pizzasRef,
      where('isBestSeller', '==', true),
      orderBy('rating', 'desc'),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Pizza[];
  } catch (error) {
    console.error('Error fetching best seller pizzas:', error);
    return [];
  }
}

/**
 * Récupère les pizzas featured (best-sellers + top rated)
 */
export async function getFeaturedPizzas(maxCount: number = 12): Promise<Pizza[]> {
  try {
    const pizzasRef = collection(db, 'pizzas');
    const q = query(
      pizzasRef,
      orderBy('isBestSeller', 'desc'),
      orderBy('rating', 'desc'),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Pizza[];
  } catch (error) {
    console.error('Error fetching featured pizzas:', error);
    return [];
  }
}
