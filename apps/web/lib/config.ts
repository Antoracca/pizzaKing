/**
 * Application Configuration
 * Centralized constants for the PizzaKing application
 */

/**
 * Delivery Configuration
 */
export const DELIVERY_CONFIG = {
  /** Delivery fee in FCFA */
  FEE: 1000,
  /** Minimum order amount for free delivery in FCFA */
  FREE_THRESHOLD: 10000,
} as const;

/**
 * User Address Configuration
 */
export const ADDRESS_CONFIG = {
  /** Maximum number of addresses a user can save */
  MAX_ADDRESSES: 5,
} as const;

/**
 * Firebase Retry Configuration
 */
export const FIREBASE_CONFIG = {
  /** Maximum number of retry attempts for Firebase operations */
  MAX_RETRIES: 3,
  /** Initial delay in ms before first retry */
  INITIAL_RETRY_DELAY: 1000,
  /** Multiplier for exponential backoff */
  RETRY_BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * Phone Validation Configuration
 */
export const PHONE_CONFIG = {
  /** Countries to try for phone validation */
  COUNTRIES: ['CF', 'FR', 'CD', 'CG', 'CM'] as const,
  /** Minimum phone number length */
  MIN_LENGTH: 8,
  /** Maximum phone number length */
  MAX_LENGTH: 15,
} as const;
