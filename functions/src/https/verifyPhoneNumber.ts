import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@pizza-king/shared';

interface VerifyPhoneNumberRequest {
  phoneNumber: string;
  verificationCode: string;
}

/**
 * Verify user phone number
 * This is a simplified version - in production, use Twilio Verify API
 */
export const verifyPhoneNumber = functions.https.onCall(
  async (data: VerifyPhoneNumberRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { phoneNumber, verificationCode } = data;

    if (!phoneNumber || !verificationCode) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Phone number and verification code are required'
      );
    }

    try {
      const db = admin.firestore();
      const userId = context.auth.uid;

      // TODO: Verify code with Twilio Verify API
      // For now, accept any 6-digit code for testing
      if (!/^\d{6}$/.test(verificationCode)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid verification code format'
        );
      }

      // Update user document
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        phoneNumber,
        isPhoneVerified: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Phone verified for user ${userId}: ${phoneNumber}`
      );

      return {
        success: true,
        message: 'Phone number verified successfully',
      };
    } catch (error: any) {
      functions.logger.error('Error verifying phone number:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error verifying phone number',
        error.message
      );
    }
  }
);
