import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '../constants';
import { sendEmail } from '../email/sendGrid';
import { buildWelcomeEmail } from '../email/templates/welcome';

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

    let firstName = '';
    let lastName = '';

    if (userDoc.exists) {
      functions.logger.info(`User document already exists for ${user.uid}`);
      // Document existe déjà (créé par le client), on récupère le nom
      const userData = userDoc.data();
      firstName = userData?.firstName || '';
      lastName = userData?.lastName || '';
    } else {
      // Document n'existe pas encore, on le crée
      // Parse display name
      const names = user.displayName?.split(' ') || ['', ''];
      firstName = names[0] || '';
      lastName = names.slice(1).join(' ') || '';

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
    }

    // 🔐 SET CUSTOM CLAIM (pour sécurité et performance)
    // TOUJOURS ajouter le claim, même si le document existait déjà
    try {
      await admin.auth().setCustomUserClaims(user.uid, {
        role: 'customer',
      });
      functions.logger.info(`Custom claim 'customer' set for ${user.uid}`);
    } catch (claimError) {
      functions.logger.error(`Failed to set custom claim for ${user.uid}`, claimError);
      // Ne pas bloquer la création si les claims échouent
    }

    if (user.email) {
      try {
        const template = buildWelcomeEmail({ firstName });
        const webAppUrl =
          process.env.WEB_APP_URL ||
          (functions.config()?.app?.web_url as string | undefined) ||
          'https://pizzaking.com';

        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html.replace(/{{WEB_APP_URL}}/g, webAppUrl),
          text: template.text.replace(/{{WEB_APP_URL}}/g, webAppUrl),
          category: 'welcome',
        });

        functions.logger.info(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        functions.logger.error(
          `Failed to send welcome email to ${user.email}`,
          emailError
        );
      }
    } else {
      functions.logger.warn(
        `No email available for user ${user.uid}; skipping welcome email`
      );
    }

    // Create welcome notification (using same db instance with pizzaking settings)
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
