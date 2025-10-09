/**
 * Script to seed initial data to Firebase Firestore
 * Run with: pnpm seed:firebase
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔧 Initializing Firebase with project:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use the specific database ID "pizzaking" in africa-south1
const db = getFirestore(app, 'pizzaking');

console.log('✅ Firestore initialized with database: pizzaking');

// Pizza data
const pizzas = [
  {
    id: 'margherita',
    name: 'Margherita',
    description: 'Tomate, mozzarella, basilic frais, huile d\'olive',
    category: 'classiques',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    ingredients: ['Sauce tomate', 'Mozzarella', 'Basilic', 'Huile d\'olive'],
    allergens: ['gluten', 'lactose'],
    nutrition: {
      calories: 800,
      protein: 35,
      carbs: 95,
      fat: 30,
    },
    available: true,
    popular: true,
    vegan: false,
    vegetarian: true,
    spicy: 0,
    preparationTime: 15,
    rating: 4.8,
    reviewCount: 245,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    description: 'Tomate, mozzarella, pepperoni épicé',
    category: 'classiques',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
    ingredients: ['Sauce tomate', 'Mozzarella', 'Pepperoni'],
    allergens: ['gluten', 'lactose'],
    nutrition: {
      calories: 950,
      protein: 42,
      carbs: 90,
      fat: 45,
    },
    available: true,
    popular: true,
    vegan: false,
    vegetarian: false,
    spicy: 1,
    preparationTime: 15,
    rating: 4.9,
    reviewCount: 389,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'quattro-formaggi',
    name: 'Quattro Formaggi',
    description: 'Mozzarella, gorgonzola, parmesan, chèvre',
    category: 'gourmandes',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=800',
    ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesan', 'Chèvre'],
    allergens: ['gluten', 'lactose'],
    nutrition: {
      calories: 1100,
      protein: 50,
      carbs: 85,
      fat: 60,
    },
    available: true,
    popular: true,
    vegan: false,
    vegetarian: true,
    spicy: 0,
    preparationTime: 18,
    rating: 4.7,
    reviewCount: 198,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vegetarienne',
    name: 'Végétarienne',
    description: 'Tomate, mozzarella, poivrons, champignons, oignons, olives',
    category: 'vegetariennes',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=800',
    ingredients: ['Sauce tomate', 'Mozzarella', 'Poivrons', 'Champignons', 'Oignons', 'Olives'],
    allergens: ['gluten', 'lactose'],
    nutrition: {
      calories: 750,
      protein: 30,
      carbs: 100,
      fat: 25,
    },
    available: true,
    popular: false,
    vegan: false,
    vegetarian: true,
    spicy: 0,
    preparationTime: 16,
    rating: 4.6,
    reviewCount: 156,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hawaienne',
    name: 'Hawaïenne',
    description: 'Tomate, mozzarella, jambon, ananas',
    category: 'classiques',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    ingredients: ['Sauce tomate', 'Mozzarella', 'Jambon', 'Ananas'],
    allergens: ['gluten', 'lactose'],
    nutrition: {
      calories: 850,
      protein: 38,
      carbs: 95,
      fat: 32,
    },
    available: true,
    popular: false,
    vegan: false,
    vegetarian: false,
    spicy: 0,
    preparationTime: 15,
    rating: 4.3,
    reviewCount: 287,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'calzone',
    name: 'Calzone',
    description: 'Pizza pliée: tomate, mozzarella, jambon, champignons, œuf',
    category: 'speciales',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    ingredients: ['Sauce tomate', 'Mozzarella', 'Jambon', 'Champignons', 'Œuf'],
    allergens: ['gluten', 'lactose', 'eggs'],
    nutrition: {
      calories: 950,
      protein: 45,
      carbs: 88,
      fat: 42,
    },
    available: true,
    popular: true,
    vegan: false,
    vegetarian: false,
    spicy: 0,
    preparationTime: 20,
    rating: 4.8,
    reviewCount: 167,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'diavola',
    name: 'Diavola',
    description: 'Tomate, mozzarella, salami piquant, piment',
    category: 'epicees',
    price: 12.49,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',
    ingredients: ['Sauce tomate', 'Mozzarella', 'Salami piquant', 'Piment'],
    allergens: ['gluten', 'lactose'],
    nutrition: {
      calories: 920,
      protein: 40,
      carbs: 87,
      fat: 48,
    },
    available: true,
    popular: true,
    vegan: false,
    vegetarian: false,
    spicy: 3,
    preparationTime: 16,
    rating: 4.7,
    reviewCount: 223,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'truffe',
    name: 'Truffe Noire',
    description: 'Crème de truffe, mozzarella, champignons, parmesan',
    category: 'gourmandes',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    ingredients: ['Crème de truffe', 'Mozzarella', 'Champignons', 'Parmesan'],
    allergens: ['gluten', 'lactose'],
    nutrition: {
      calories: 1050,
      protein: 42,
      carbs: 82,
      fat: 58,
    },
    available: true,
    popular: false,
    vegan: false,
    vegetarian: true,
    spicy: 0,
    preparationTime: 20,
    rating: 4.9,
    reviewCount: 89,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Categories
const categories = [
  {
    id: 'classiques',
    name: 'Classiques',
    description: 'Nos pizzas traditionnelles',
    icon: '🍕',
    order: 1,
  },
  {
    id: 'gourmandes',
    name: 'Gourmandes',
    description: 'Pour les amateurs de saveurs riches',
    icon: '🧀',
    order: 2,
  },
  {
    id: 'vegetariennes',
    name: 'Végétariennes',
    description: 'Sans viande, pleines de saveurs',
    icon: '🥬',
    order: 3,
  },
  {
    id: 'epicees',
    name: 'Épicées',
    description: 'Pour les amateurs de sensations fortes',
    icon: '🌶️',
    order: 4,
  },
  {
    id: 'speciales',
    name: 'Spéciales',
    description: 'Nos créations uniques',
    icon: '⭐',
    order: 5,
  },
];

async function seedData() {
  try {
    console.log('🌱 Starting Firebase seeding...\n');

    // Seed Categories
    console.log('📁 Seeding categories...');
    for (const category of categories) {
      await setDoc(doc(db, 'categories', category.id), category);
      console.log(`  ✅ ${category.name}`);
    }
    console.log(`✅ ${categories.length} categories created\n`);

    // Seed Pizzas
    console.log('🍕 Seeding pizzas...');
    for (const pizza of pizzas) {
      await setDoc(doc(db, 'pizzas', pizza.id), pizza);
      console.log(`  ✅ ${pizza.name} - ${pizza.price}€`);
    }
    console.log(`✅ ${pizzas.length} pizzas created\n`);

    console.log('🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${pizzas.length} pizzas`);
    console.log('\n✅ Firebase is ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed
seedData();
