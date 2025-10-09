import { Timestamp } from 'firebase/firestore';
import { PizzaSize } from './pizza';

export type OrderType = 'delivery' | 'pickup';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface OrderCustomization {
  crust?: { id: string; name: string; price: number };
  sauce?: { id: string; name: string; price: number };
  extraToppings: Array<{ id: string; name: string; price: number }>;
  removedIngredients: string[];
}

export interface OrderItem {
  pizzaId: string;
  pizzaName: string;
  pizzaImage: string;
  size: PizzaSize;
  quantity: number;
  basePrice: number;
  customization: OrderCustomization;
  instructions?: string;
  subtotal: number;
}

export interface DeliveryAddress {
  addressId?: string;
  fullAddress: string;
  streetAddress: string;
  city: string;
  zipCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  deliveryInstructions?: string;
  floor?: string;
  building?: string;
}

export interface TrackingUpdate {
  status: string;
  timestamp: Timestamp;
  location?: { latitude: number; longitude: number };
  notes?: string;
}

export interface DeliveryInfo {
  delivererId?: string;
  delivererName?: string;
  delivererPhone?: string;
  vehicleType?: string;
  estimatedDeliveryTime: Timestamp;
  actualDeliveryTime?: Timestamp;
  trackingUpdates: TrackingUpdate[];
}

export interface PickupInfo {
  estimatedReadyTime: Timestamp;
  actualReadyTime?: Timestamp;
  pickupCode: string;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  total: number;
}

export interface PromoCodeInfo {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  appliedAmount: number;
}

export interface OrderPayment {
  method: 'card' | 'paypal' | 'mobile_money' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  provider?: string;
  cashReceived?: number;
  changeToReturn?: number;
  paidAt?: Timestamp;
  refundedAt?: Timestamp;
  refundReason?: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: Timestamp;
  changedBy?: string;
  notes?: string;
}

export interface OrderRating {
  foodRating: number;
  deliveryRating?: number;
  comment?: string;
  images?: string[];
  createdAt: Timestamp;
}

export interface UserInfo {
  displayName: string;
  phoneNumber: string;
  email: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userInfo: UserInfo;
  items: OrderItem[];
  orderType: OrderType;
  deliveryAddress?: DeliveryAddress;
  deliveryInfo?: DeliveryInfo;
  pickupInfo?: PickupInfo;
  pricing: OrderPricing;
  promoCode?: PromoCodeInfo;
  payment: OrderPayment;
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  rating?: OrderRating;
  internalNotes?: string;
  loyaltyPointsEarned: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  estimatedPreparationTime: number;
  estimatedTotalTime: number;
  isFirstOrder: boolean;
  isGift: boolean;
}
