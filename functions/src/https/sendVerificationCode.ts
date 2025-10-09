import * as functions from 'firebase-functions';

interface SendVerificationCodeRequest {
  phoneNumber: string;
}

/**
 * Send verification code to phone number
 * This is a simplified version - in production, use Twilio Verify API
 */
export const sendVerificationCode = functions.https.onCall(
  async (data: SendVerificationCodeRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { phoneNumber } = data;

    if (!phoneNumber) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Phone number is required'
      );
    }

    try {
      // TODO: Send verification code via Twilio
      // const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      // await twilioClient.messages.create({
      //   body: `Your Pizza King verification code is: ${verificationCode}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // });

      functions.logger.info(
        `Verification code sent to ${phoneNumber} for user ${context.auth.uid}`
      );

      return {
        success: true,
        message: 'Verification code sent successfully',
        // In production, don't return the code
        // For testing purposes only:
        code: '123456',
      };
    } catch (error: any) {
      functions.logger.error('Error sending verification code:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error sending verification code',
        error.message
      );
    }
  }
);
