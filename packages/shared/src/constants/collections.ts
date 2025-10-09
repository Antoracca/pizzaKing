/**
 * Firestore Collection Names
 */
export const COLLECTIONS = {
  USERS: 'users',
  PIZZAS: 'pizzas',
  ORDERS: 'orders',
  ADDRESSES: 'addresses',
  PROMOTIONS: 'promotions',
  NOTIFICATIONS: 'notifications',
  LOYALTY_TRANSACTIONS: 'loyaltyTransactions',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
