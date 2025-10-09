import type { LoyaltyTier } from '../types';
import { LOYALTY_TIER_THRESHOLDS } from '../constants';

/**
 * Generate a unique order number
 */
export const generateOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `PK-${year}-${random}`;
};

/**
 * Generate a unique referral code
 */
export const generateReferralCode = (name: string): string => {
  const cleaned = name.replace(/\s/g, '').toUpperCase().substring(0, 4);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${cleaned}${random}`;
};

/**
 * Generate a pickup code (4 digits)
 */
export const generatePickupCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Determine loyalty tier based on points
 */
export const getLoyaltyTier = (points: number): LoyaltyTier => {
  if (points >= LOYALTY_TIER_THRESHOLDS.platinum) return 'platinum';
  if (points >= LOYALTY_TIER_THRESHOLDS.gold) return 'gold';
  if (points >= LOYALTY_TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
};

/**
 * Create slug from string
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalize accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .trim();
};

/**
 * Sleep utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  if (typeof obj === 'string') return obj.trim().length === 0;
  return false;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get random item from array
 */
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Group array by key
 */
export const groupBy = <T>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
};

/**
 * Remove duplicates from array
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if time is within business hours
 */
export const isWithinBusinessHours = (time: Date = new Date()): boolean => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const currentTime = hours * 60 + minutes;

  // 11:00 - 23:00
  const openTime = 11 * 60; // 11:00
  const closeTime = 23 * 60; // 23:00

  return currentTime >= openTime && currentTime <= closeTime;
};
