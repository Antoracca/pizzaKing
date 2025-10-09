import {
  TAX_RATE,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  POINTS_PER_EURO,
  EURO_PER_POINT,
} from '../constants/app';
import type { OrderItem, OrderPricing } from '../types';

/**
 * Calculate order subtotal
 */
export const calculateSubtotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.subtotal, 0);
};

/**
 * Calculate delivery fee based on subtotal
 */
export const calculateDeliveryFee = (
  subtotal: number,
  isDelivery: boolean
): number => {
  if (!isDelivery) return 0;
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return DELIVERY_FEE;
};

/**
 * Calculate tax amount
 */
export const calculateTax = (subtotal: number): number => {
  return subtotal * TAX_RATE;
};

/**
 * Calculate total price
 */
export const calculateTotal = (pricing: Partial<OrderPricing>): number => {
  const {
    subtotal = 0,
    deliveryFee = 0,
    taxAmount = 0,
    discountAmount = 0,
    loyaltyDiscount = 0,
  } = pricing;

  return Math.max(
    0,
    subtotal + deliveryFee + taxAmount - discountAmount - loyaltyDiscount
  );
};

/**
 * Calculate order pricing
 */
export const calculateOrderPricing = (
  items: OrderItem[],
  isDelivery: boolean,
  discountAmount = 0,
  loyaltyPointsUsed = 0
): OrderPricing => {
  const subtotal = calculateSubtotal(items);
  const deliveryFee = calculateDeliveryFee(subtotal, isDelivery);
  const taxAmount = calculateTax(subtotal);
  const loyaltyDiscount = loyaltyPointsUsed * EURO_PER_POINT;

  const total = calculateTotal({
    subtotal,
    deliveryFee,
    taxAmount,
    discountAmount,
    loyaltyDiscount,
  });

  return {
    subtotal,
    deliveryFee,
    taxAmount,
    discountAmount,
    loyaltyPointsUsed,
    loyaltyDiscount,
    total,
  };
};

/**
 * Calculate loyalty points earned
 */
export const calculateLoyaltyPoints = (amount: number): number => {
  return Math.floor(amount * POINTS_PER_EURO);
};

/**
 * Calculate discount amount based on type
 */
export const calculateDiscountAmount = (
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  maxDiscount?: number
): number => {
  let discount = 0;

  if (discountType === 'percentage') {
    discount = subtotal * (discountValue / 100);
  } else {
    discount = discountValue;
  }

  if (maxDiscount !== undefined) {
    discount = Math.min(discount, maxDiscount);
  }

  return Math.min(discount, subtotal);
};

/**
 * Calculate estimated delivery time based on distance
 */
export const calculateEstimatedDeliveryTime = (
  distanceKm: number,
  preparationTime: number
): number => {
  // Average speed: 25 km/h in city
  const deliveryTime = (distanceKm / 25) * 60; // Convert to minutes
  return Math.ceil(preparationTime + deliveryTime);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calculate pizza item price with customizations
 */
export const calculatePizzaItemPrice = (
  basePrice: number,
  quantity: number,
  customization: {
    crust?: { price: number };
    sauce?: { price: number };
    extraToppings: Array<{ price: number }>;
  }
): number => {
  let itemPrice = basePrice;

  if (customization.crust) {
    itemPrice += customization.crust.price;
  }

  if (customization.sauce) {
    itemPrice += customization.sauce.price;
  }

  if (customization.extraToppings?.length > 0) {
    const toppingsPrice = customization.extraToppings.reduce(
      (sum, topping) => sum + topping.price,
      0
    );
    itemPrice += toppingsPrice;
  }

  return itemPrice * quantity;
};
