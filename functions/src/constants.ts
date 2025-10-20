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
  SUPPORT_TICKETS: 'supportTickets',
} as const;

/**
 * User Roles
 */
export type UserRole =
  | 'customer'
  | 'admin'
  | 'superadmin'
  | 'support_agent'
  | 'support_manager'
  | 'support_backoffice'
  | 'deliverer';
