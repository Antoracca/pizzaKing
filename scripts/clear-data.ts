import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/firebase-config';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

/**
 * Clear a collection
 */
async function clearCollection(collectionName: string) {
  console.log(`🗑️  Clearing collection: ${collectionName}...`);

  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`   Collection ${collectionName} is already empty`);
    return 0;
  }

  const batch = db.batch();
  let count = 0;

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
    count++;
  });

  await batch.commit();
  console.log(`✅ ${count} documents deleted from ${collectionName}`);
  return count;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting database cleanup...\n');

  try {
    let totalDeleted = 0;

    // Clear all collections
    totalDeleted += await clearCollection(COLLECTIONS.PIZZAS);
    totalDeleted += await clearCollection(COLLECTIONS.USERS);
    totalDeleted += await clearCollection(COLLECTIONS.ORDERS);
    totalDeleted += await clearCollection(COLLECTIONS.PROMOTIONS);
    totalDeleted += await clearCollection(COLLECTIONS.ADDRESSES);
    totalDeleted += await clearCollection(COLLECTIONS.NOTIFICATIONS);
    totalDeleted += await clearCollection(COLLECTIONS.LOYALTY_TRANSACTIONS);

    console.log(`\n🎉 Cleanup completed successfully!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
