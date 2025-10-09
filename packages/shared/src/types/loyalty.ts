import { Timestamp } from 'firebase/firestore';

export type LoyaltyTransactionType =
  | 'earn'
  | 'redeem'
  | 'expire'
  | 'bonus'
  | 'refund';

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: LoyaltyTransactionType;
  points: number;
  orderId?: string;
  description: string;
  balanceAfter: number;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  validUntil?: Timestamp;
}
