// Application constants

export const APP_NAME = 'Pizza King';
export const APP_TAGLINE = 'La meilleure pizza livrée chez vous';
export const APP_DESCRIPTION =
  'Commandez vos pizzas préférées en quelques clics';

// Contact
export const CONTACT_EMAIL = 'contact@pizzaking.com';
export const CONTACT_PHONE = '+226 XX XX XX XX';
export const SUPPORT_EMAIL = 'support@pizzaking.com';

// Social media
export const SOCIAL_MEDIA = {
  facebook: 'https://facebook.com/pizzaking',
  instagram: 'https://instagram.com/pizzaking',
  twitter: 'https://twitter.com/pizzaking',
};

// Business hours
export const BUSINESS_HOURS = {
  monday: { open: '11:00', close: '23:00' },
  tuesday: { open: '11:00', close: '23:00' },
  wednesday: { open: '11:00', close: '23:00' },
  thursday: { open: '11:00', close: '23:00' },
  friday: { open: '11:00', close: '23:59' },
  saturday: { open: '11:00', close: '23:59' },
  sunday: { open: '11:00', close: '23:00' },
};

// Delivery
export const MIN_ORDER_AMOUNT = 10; // €
export const DELIVERY_FEE = 3; // €
export const FREE_DELIVERY_THRESHOLD = 25; // €
export const MAX_DELIVERY_DISTANCE = 10; // km
export const AVERAGE_PREPARATION_TIME = 20; // minutes
export const AVERAGE_DELIVERY_TIME = 25; // minutes

// Loyalty
export const POINTS_PER_EURO = 1;
export const EURO_PER_POINT = 0.05; // 100 points = 5€
export const MIN_POINTS_TO_REDEEM = 100;

// Limits
export const MAX_ITEMS_PER_ORDER = 20;
export const MAX_QUANTITY_PER_ITEM = 10;
export const MAX_ADDRESSES_PER_USER = 5;

// Timeouts
export const ORDER_CONFIRMATION_TIMEOUT = 5; // minutes
export const PAYMENT_TIMEOUT = 10; // minutes

// Tax
export const TAX_RATE = 0.1; // 10% TVA

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// API
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;
