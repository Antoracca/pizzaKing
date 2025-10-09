import * as admin from 'firebase-admin';
import { Pizza, User, Promotion, Address } from '@pizza-king/shared';
import { COLLECTIONS } from '@pizza-king/firebase-config';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

/**
 * Seed Pizzas
 */
async function seedPizzas() {
  console.log('🍕 Seeding pizzas...');

  const pizzas: Omit<Pizza, 'id'>[] = [
    {
      name: 'Margherita',
      slug: 'margherita',
      description: 'La pizza classique italienne avec tomate, mozzarella et basilic frais',
      category: 'classique',
      basePrice: 6000,
      images: [
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
      ],
      sizes: [
        { size: 'small', name: 'Petite (20cm)', price: 6000, diameter: 20 },
        { size: 'medium', name: 'Moyenne (30cm)', price: 9000, diameter: 30 },
        { size: 'large', name: 'Grande (40cm)', price: 12000, diameter: 40 },
      ],
      crusts: [
        { type: 'thin', name: 'Pâte fine', priceModifier: 0 },
        { type: 'thick', name: 'Pâte épaisse', priceModifier: 500 },
        { type: 'stuffed', name: 'Pâte farcie au fromage', priceModifier: 1500 },
      ],
      ingredients: [
        { name: 'Sauce tomate', isDefault: true, category: 'sauce', price: 0 },
        { name: 'Mozzarella', isDefault: true, category: 'cheese', price: 0 },
        { name: 'Basilic frais', isDefault: true, category: 'vegetable', price: 0 },
      ],
      availableIngredients: [
        { name: 'Olives noires', category: 'vegetable', price: 300 },
        { name: 'Champignons', category: 'vegetable', price: 400 },
        { name: 'Oignons', category: 'vegetable', price: 200 },
        { name: 'Poivrons', category: 'vegetable', price: 300 },
        { name: 'Fromage supplémentaire', category: 'cheese', price: 500 },
      ],
      preparationTime: 15,
      isAvailable: true,
      isVegetarian: true,
      isSpicy: false,
      calories: 800,
      allergens: ['gluten', 'lactose'],
      tags: ['populaire', 'classique'],
      rating: 4.8,
      reviewCount: 245,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      name: 'Reine',
      slug: 'reine',
      description: 'Pizza garnie de jambon, champignons et mozzarella',
      category: 'classique',
      basePrice: 7500,
      images: [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      ],
      sizes: [
        { size: 'small', name: 'Petite (20cm)', price: 7500, diameter: 20 },
        { size: 'medium', name: 'Moyenne (30cm)', price: 10500, diameter: 30 },
        { size: 'large', name: 'Grande (40cm)', price: 14000, diameter: 40 },
      ],
      crusts: [
        { type: 'thin', name: 'Pâte fine', priceModifier: 0 },
        { type: 'thick', name: 'Pâte épaisse', priceModifier: 500 },
        { type: 'stuffed', name: 'Pâte farcie au fromage', priceModifier: 1500 },
      ],
      ingredients: [
        { name: 'Sauce tomate', isDefault: true, category: 'sauce', price: 0 },
        { name: 'Mozzarella', isDefault: true, category: 'cheese', price: 0 },
        { name: 'Jambon', isDefault: true, category: 'meat', price: 0 },
        { name: 'Champignons', isDefault: true, category: 'vegetable', price: 0 },
      ],
      availableIngredients: [
        { name: 'Olives', category: 'vegetable', price: 300 },
        { name: 'Oignons', category: 'vegetable', price: 200 },
        { name: 'Poivrons', category: 'vegetable', price: 300 },
        { name: 'Fromage supplémentaire', category: 'cheese', price: 500 },
        { name: 'Œuf', category: 'protein', price: 400 },
      ],
      preparationTime: 18,
      isAvailable: true,
      isVegetarian: false,
      isSpicy: false,
      calories: 950,
      allergens: ['gluten', 'lactose'],
      tags: ['populaire', 'classique'],
      rating: 4.6,
      reviewCount: 189,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      name: '4 Fromages',
      slug: '4-fromages',
      description: 'Mozzarella, gorgonzola, parmesan et fromage de chèvre',
      category: 'fromage',
      basePrice: 8500,
      images: [
        'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=800',
      ],
      sizes: [
        { size: 'small', name: 'Petite (20cm)', price: 8500, diameter: 20 },
        { size: 'medium', name: 'Moyenne (30cm)', price: 12000, diameter: 30 },
        { size: 'large', name: 'Grande (40cm)', price: 15500, diameter: 40 },
      ],
      crusts: [
        { type: 'thin', name: 'Pâte fine', priceModifier: 0 },
        { type: 'thick', name: 'Pâte épaisse', priceModifier: 500 },
        { type: 'stuffed', name: 'Pâte farcie au fromage', priceModifier: 1500 },
      ],
      ingredients: [
        { name: 'Sauce crème', isDefault: true, category: 'sauce', price: 0 },
        { name: 'Mozzarella', isDefault: true, category: 'cheese', price: 0 },
        { name: 'Gorgonzola', isDefault: true, category: 'cheese', price: 0 },
        { name: 'Parmesan', isDefault: true, category: 'cheese', price: 0 },
        { name: 'Fromage de chèvre', isDefault: true, category: 'cheese', price: 0 },
      ],
      availableIngredients: [
        { name: 'Noix', category: 'vegetable', price: 400 },
        { name: 'Miel', category: 'condiment', price: 300 },
        { name: 'Roquette', category: 'vegetable', price: 200 },
      ],
      preparationTime: 16,
      isAvailable: true,
      isVegetarian: true,
      isSpicy: false,
      calories: 1100,
      allergens: ['gluten', 'lactose'],
      tags: ['fromage', 'gourmet'],
      rating: 4.9,
      reviewCount: 312,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      name: 'Pepperoni',
      slug: 'pepperoni',
      description: 'Pizza américaine classique avec pepperoni épicé',
      category: 'viande',
      basePrice: 8000,
      images: [
        'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
      ],
      sizes: [
        { size: 'small', name: 'Petite (20cm)', price: 8000, diameter: 20 },
        { size: 'medium', name: 'Moyenne (30cm)', price: 11000, diameter: 30 },
        { size: 'large', name: 'Grande (40cm)', price: 14500, diameter: 40 },
      ],
      crusts: [
        { type: 'thin', name: 'Pâte fine', priceModifier: 0 },
        { type: 'thick', name: 'Pâte épaisse', priceModifier: 500 },
        { type: 'stuffed', name: 'Pâte farcie au fromage', priceModifier: 1500 },
      ],
      ingredients: [
        { name: 'Sauce tomate', isDefault: true, category: 'sauce', price: 0 },
        { name: 'Mozzarella', isDefault: true, category: 'cheese', price: 0 },
        { name: 'Pepperoni', isDefault: true, category: 'meat', price: 0 },
      ],
      availableIngredients: [
        { name: 'Piment jalapeño', category: 'vegetable', price: 300 },
        { name: 'Oignons', category: 'vegetable', price: 200 },
        { name: 'Olives', category: 'vegetable', price: 300 },
        { name: 'Fromage supplémentaire', category: 'cheese', price: 500 },
      ],
      preparationTime: 17,
      isAvailable: true,
      isVegetarian: false,
      isSpicy: true,
      calories: 1050,
      allergens: ['gluten', 'lactose'],
      tags: ['épicée', 'populaire'],
      rating: 4.7,
      reviewCount: 278,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      name: 'Végétarienne',
      slug: 'vegetarienne',
      description: 'Pizza garnie de légumes frais de saison',
      category: 'vegetarienne',
      basePrice: 7000,
      images: [
        'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=800',
      ],
      sizes: [
        { size: 'small', name: 'Petite (20cm)', price: 7000, diameter: 20 },
        { size: 'medium', name: 'Moyenne (30cm)', price: 10000, diameter: 30 },
        { size: 'large', name: 'Grande (40cm)', price: 13000, diameter: 40 },
      ],
      crusts: [
        { type: 'thin', name: 'Pâte fine', priceModifier: 0 },
        { type: 'thick', name: 'Pâte épaisse', priceModifier: 500 },
        { type: 'stuffed', name: 'Pâte farcie au fromage', priceModifier: 1500 },
      ],
      ingredients: [
        { name: 'Sauce tomate', isDefault: true, category: 'sauce', price: 0 },
        { name: 'Mozzarella', isDefault: true, category: 'cheese', price: 0 },
        { name: 'Poivrons', isDefault: true, category: 'vegetable', price: 0 },
        { name: 'Champignons', isDefault: true, category: 'vegetable', price: 0 },
        { name: 'Oignons', isDefault: true, category: 'vegetable', price: 0 },
        { name: 'Tomates fraîches', isDefault: true, category: 'vegetable', price: 0 },
        { name: 'Olives', isDefault: true, category: 'vegetable', price: 0 },
      ],
      availableIngredients: [
        { name: 'Aubergines', category: 'vegetable', price: 400 },
        { name: 'Courgettes', category: 'vegetable', price: 400 },
        { name: 'Roquette', category: 'vegetable', price: 300 },
        { name: 'Artichauts', category: 'vegetable', price: 500 },
      ],
      preparationTime: 16,
      isAvailable: true,
      isVegetarian: true,
      isSpicy: false,
      calories: 750,
      allergens: ['gluten', 'lactose'],
      tags: ['végétarienne', 'légumes'],
      rating: 4.5,
      reviewCount: 156,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      name: 'BBQ Chicken',
      slug: 'bbq-chicken',
      description: 'Poulet mariné, oignons rouges, sauce BBQ',
      category: 'signature',
      basePrice: 9000,
      images: [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      ],
      sizes: [
        { size: 'small', name: 'Petite (20cm)', price: 9000, diameter: 20 },
        { size: 'medium', name: 'Moyenne (30cm)', price: 12500, diameter: 30 },
        { size: 'large', name: 'Grande (40cm)', price: 16000, diameter: 40 },
      ],
      crusts: [
        { type: 'thin', name: 'Pâte fine', priceModifier: 0 },
        { type: 'thick', name: 'Pâte épaisse', priceModifier: 500 },
        { type: 'stuffed', name: 'Pâte farcie au fromage', priceModifier: 1500 },
      ],
      ingredients: [
        { name: 'Sauce BBQ', isDefault: true, category: 'sauce', price: 0 },
        { name: 'Mozzarella', isDefault: true, category: 'cheese', price: 0 },
        { name: 'Poulet mariné', isDefault: true, category: 'meat', price: 0 },
        { name: 'Oignons rouges', isDefault: true, category: 'vegetable', price: 0 },
        { name: 'Coriandre fraîche', isDefault: true, category: 'vegetable', price: 0 },
      ],
      availableIngredients: [
        { name: 'Bacon', category: 'meat', price: 600 },
        { name: 'Poivrons', category: 'vegetable', price: 300 },
        { name: 'Jalapeños', category: 'vegetable', price: 300 },
        { name: 'Fromage cheddar', category: 'cheese', price: 500 },
      ],
      preparationTime: 20,
      isAvailable: true,
      isVegetarian: false,
      isSpicy: false,
      calories: 1000,
      allergens: ['gluten', 'lactose'],
      tags: ['signature', 'populaire', 'poulet'],
      rating: 4.8,
      reviewCount: 298,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
  ];

  const batch = db.batch();
  let count = 0;

  for (const pizza of pizzas) {
    const docRef = db.collection(COLLECTIONS.PIZZAS).doc();
    batch.set(docRef, {
      id: docRef.id,
      ...pizza,
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ ${count} pizzas ajoutées`);
}

/**
 * Seed Users (Test Accounts)
 */
async function seedUsers() {
  console.log('👥 Seeding users...');

  const users: Omit<User, 'id'>[] = [
    {
      email: 'admin@pizzaking.com',
      phoneNumber: '+22670123456',
      firstName: 'Admin',
      lastName: 'Pizza King',
      role: 'admin',
      profileImage: 'https://i.pravatar.cc/150?img=1',
      isEmailVerified: true,
      isPhoneVerified: true,
      loyaltyPoints: 0,
      preferences: {
        newsletter: true,
        pushNotifications: true,
        smsNotifications: true,
        whatsappNotifications: true,
        favoriteSize: 'medium',
        favoriteCrust: 'thin',
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      email: 'client@test.com',
      phoneNumber: '+22670234567',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'customer',
      profileImage: 'https://i.pravatar.cc/150?img=3',
      isEmailVerified: true,
      isPhoneVerified: true,
      loyaltyPoints: 250,
      preferences: {
        newsletter: true,
        pushNotifications: true,
        smsNotifications: true,
        whatsappNotifications: false,
        favoriteSize: 'large',
        favoriteCrust: 'thick',
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      email: 'deliverer@pizzaking.com',
      phoneNumber: '+22670345678',
      firstName: 'Mohamed',
      lastName: 'Traoré',
      role: 'deliverer',
      profileImage: 'https://i.pravatar.cc/150?img=12',
      isEmailVerified: true,
      isPhoneVerified: true,
      loyaltyPoints: 0,
      delivererInfo: {
        vehicleType: 'moto',
        vehiclePlate: 'BF-2345-AB',
        isAvailable: true,
        rating: 4.7,
        deliveryCount: 142,
        currentLocation: {
          latitude: 12.3714,
          longitude: -1.5197,
          accuracy: 10,
          timestamp: admin.firestore.Timestamp.now(),
        },
      },
      preferences: {
        newsletter: false,
        pushNotifications: true,
        smsNotifications: true,
        whatsappNotifications: true,
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
  ];

  const batch = db.batch();
  let count = 0;

  for (const user of users) {
    const docRef = db.collection(COLLECTIONS.USERS).doc();
    batch.set(docRef, {
      id: docRef.id,
      ...user,
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ ${count} utilisateurs ajoutés`);
}

/**
 * Seed Promotions
 */
async function seedPromotions() {
  console.log('🎁 Seeding promotions...');

  const promotions: Omit<Promotion, 'id'>[] = [
    {
      code: 'WELCOME10',
      description: 'Réduction de 10% pour les nouveaux clients',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 5000,
      maxDiscountAmount: 2000,
      startDate: admin.firestore.Timestamp.now(),
      endDate: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ), // +30 jours
      usageLimit: 1000,
      usageCount: 0,
      isActive: true,
      applicableCategories: [],
      excludedPizzaIds: [],
      firstOrderOnly: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      code: 'SUMMER2025',
      description: 'Promotion été: 3000 FCFA de réduction',
      discountType: 'fixed',
      discountValue: 3000,
      minOrderAmount: 10000,
      startDate: admin.firestore.Timestamp.now(),
      endDate: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      ), // +60 jours
      usageLimit: 500,
      usageCount: 12,
      isActive: true,
      applicableCategories: [],
      excludedPizzaIds: [],
      firstOrderOnly: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      code: 'LOYALTY20',
      description: 'Réduction de 20% pour clients fidèles',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 8000,
      maxDiscountAmount: 5000,
      startDate: admin.firestore.Timestamp.now(),
      endDate: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      ), // +90 jours
      usageLimit: 5000,
      usageCount: 234,
      isActive: true,
      applicableCategories: [],
      excludedPizzaIds: [],
      firstOrderOnly: false,
      minLoyaltyPoints: 100,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
  ];

  const batch = db.batch();
  let count = 0;

  for (const promo of promotions) {
    const docRef = db.collection(COLLECTIONS.PROMOTIONS).doc();
    batch.set(docRef, {
      id: docRef.id,
      ...promo,
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ ${count} promotions ajoutées`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Démarrage du seed de la base de données...\n');

  try {
    await seedPizzas();
    await seedUsers();
    await seedPromotions();

    console.log('\n🎉 Seed terminé avec succès !');
    console.log('\n📊 Résumé:');
    console.log('- 6 pizzas ajoutées');
    console.log('- 3 utilisateurs de test ajoutés');
    console.log('- 3 promotions ajoutées');
    console.log('\n💡 Comptes de test:');
    console.log('- Admin: admin@pizzaking.com');
    console.log('- Client: client@test.com');
    console.log('- Livreur: deliverer@pizzaking.com');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
