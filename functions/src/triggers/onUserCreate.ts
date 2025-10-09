import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';

/**
 * Triggered when a new user is created in Firebase Auth
 * Creates corresponding Firestore user document
 */
export const onUserCreate = functions.auth.user().onCreate(async user => {
  functions.logger.info(`New user created: ${user.uid}`, {
    email: user.email,
    displayName: user.displayName,
  });

  try {
    const db = admin.firestore();
    const userRef = db.collection(COLLECTIONS.USERS).doc(user.uid);

    // Check if user document already exists
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      functions.logger.info(`User document already exists for ${user.uid}`);
      return;
    }

    // Parse display name
    const names = user.displayName?.split(' ') || ['', ''];
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    // Create user document
    await userRef.set({
      id: user.uid,
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      firstName,
      lastName,
      role: 'customer',
      profileImage: user.photoURL || '',
      isEmailVerified: user.emailVerified,
      isPhoneVerified: !!user.phoneNumber,
      loyaltyPoints: 0,
      preferences: {
        newsletter: true,
        pushNotifications: true,
        smsNotifications: false,
        whatsappNotifications: false,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`User document created successfully for ${user.uid}`);

    // Send welcome email (TODO: implement with SendGrid)
    // await sendWelcomeEmail(user.email, firstName);

    // Create welcome notification
    await db.collection(COLLECTIONS.NOTIFICATIONS).add({
      userId: user.uid,
      type: 'welcome',
      title: 'Bienvenue chez Pizza King! 🍕',
      body: 'Merci de vous être inscrit. Profitez de 10% de réduction sur votre première commande avec le code WELCOME10.',
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Welcome notification created for ${user.uid}`);
  } catch (error) {
    functions.logger.error('Error in onUserCreate:', error);
    throw error;
  }
});
