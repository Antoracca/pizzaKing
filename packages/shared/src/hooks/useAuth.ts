/**
 * Re-export useAuth hook from AuthContext
 * This file provides a cleaner import path for consumers
 */
export { useAuth } from '../contexts/AuthContext';
export type { User, UserStatus, UserRole, LoyaltyTier, Language, UserPreferences, UserStats, DelivererInfo } from '../types/user';
