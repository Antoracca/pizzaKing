import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { UserRole } from '../constants';

const COLLECTIONS = {
  USERS: 'users'
};

interface SetUserRoleRequest {
  userId: string;
  role: UserRole;
}

/**
 * Set user role (Admin only)
 * Sets custom claims for role-based access control
 */
export const setUserRole = functions.https.onCall(
  async (data: SetUserRoleRequest, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Check if caller is admin
    const dbCheck = admin.firestore();
    const callerDoc = await dbCheck
      .collection(COLLECTIONS.USERS)
      .doc(context.auth.uid)
      .get();

    const callerRole = callerDoc.data()?.role;

    if (callerRole !== 'admin' && callerRole !== 'superadmin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can set user roles'
      );
    }

    const { userId, role } = data;

    if (!userId || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User ID and role are required'
      );
    }

    // Validate role
    const validRoles: UserRole[] = [
      'customer',
      'admin',
      'deliverer',
      'superadmin',
    ];
    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid role');
    }

    // Prevent non-superadmin from creating superadmin
    if (role === 'superadmin' && callerRole !== 'superadmin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only superadmins can create superadmin users'
      );
    }

    try {
      const db = admin.firestore();

      // Set custom claims
      await admin.auth().setCustomUserClaims(userId, { role });

      // Update Firestore document
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Role updated for user ${userId} to ${role} by ${context.auth.uid}`
      );

      return {
        success: true,
        message: `User role updated to ${role}`,
      };
    } catch (error: any) {
      functions.logger.error('Error setting user role:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error setting user role',
        error.message
      );
    }
  }
);
