import { Timestamp } from 'firebase/firestore';

export type UserRole = 'customer' | 'admin' | 'deliverer' | 'superadmin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type Language = 'fr' | 'en' | 'ar';

export interface UserPreferences {
  notifications: {
    push: boolean;
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  language: Language;
  newsletter: boolean;
}

export interface UserStats {
  averageOrderValue: number;
  favoriteProducts: string[]; // Pizza IDs
  lastOrderDate?: Timestamp;
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  photoURL?: string;
  defaultAddressId?: string;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  totalSpent: number;
  totalOrders: number;
  preferences: UserPreferences;
  referralCode: string;
  referredBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  stats?: UserStats;
  provider?: 'password' | 'google';
  hasPassword?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface DelivererInfo extends User {
  role: 'deliverer';
  vehicleType: 'moto' | 'car' | 'bike';
  vehicleNumber: string;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Timestamp;
  };
  deliveryStats: {
    totalDeliveries: number;
    averageRating: number;
    onTimeRate: number;
  };
}
