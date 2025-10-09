import { UserRole, LoyaltyTier } from '../types';

export const USER_ROLES: UserRole[] = [
  'customer',
  'admin',
  'deliverer',
  'superadmin',
];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Client',
  admin: 'Administrateur',
  deliverer: 'Livreur',
  superadmin: 'Super Admin',
};

export const LOYALTY_TIERS: LoyaltyTier[] = [
  'bronze',
  'silver',
  'gold',
  'platinum',
];

export const LOYALTY_TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze: 'Bronze',
  silver: 'Argent',
  gold: 'Or',
  platinum: 'Platine',
};

export const LOYALTY_TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  bronze: 0,
  silver: 100,
  gold: 500,
  platinum: 1000,
};

export const LOYALTY_TIER_BENEFITS: Record<LoyaltyTier, string[]> = {
  bronze: ['1 point = 1€ dépensé', 'Promotions exclusives'],
  silver: ['1.2 points par €', 'Livraison gratuite à partir de 20€', 'Promotions exclusives'],
  gold: ['1.5 points par €', 'Livraison toujours gratuite', 'Accès anticipé aux nouvelles pizzas'],
  platinum: ['2 points par €', 'Livraison prioritaire', 'Pizza anniversaire offerte', 'Support VIP'],
};
