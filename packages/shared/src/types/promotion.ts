import { Timestamp } from 'firebase/firestore';

export type PromotionDiscountType =
  | 'percentage'
  | 'fixed'
  | 'free_delivery'
  | 'free_item';

export type PromotionStatus = 'draft' | 'active' | 'expired' | 'archived';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  applicableProducts?: string[];
  firstOrderOnly: boolean;
  maxTotalUses?: number;
  maxUsesPerUser: number;
  currentUses: number;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  status: PromotionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
