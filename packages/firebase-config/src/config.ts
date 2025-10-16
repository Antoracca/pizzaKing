// Firebase Client Configuration (Web & Mobile)
export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firestore collections names
export const COLLECTIONS = {
  USERS: 'users',
  PIZZAS: 'pizzas',
  ORDERS: 'orders',
  ADDRESSES: 'addresses',
  PROMOTIONS: 'promotions',
  LOYALTY: 'loyalty',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
} as const;

// Firebase Storage paths
export const STORAGE_PATHS = {
  PIZZAS: 'pizzas',
  USERS: 'users',
  REVIEWS: 'reviews',
  ADMIN: 'admin',
} as const;
