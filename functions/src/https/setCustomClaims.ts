import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * 🔐 FONCTION ULTRA-SÉCURISÉE - Définir les custom claims (rôles)
 *
 * SÉCURITÉ:
 * - Accessible UNIQUEMENT par un superadmin
 * - Validation stricte de tous les paramètres
 * - Impossible d'auto-promouvoir
 * - Logs complets pour audit
 *
 * Usage:
 * POST https://YOUR_REGION-pizzaking-e99b1.cloudfunctions.net/setCustomClaims
 * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
 * Body: { "userId": "xxx", "role": "admin" }
 */

// Liste blanche des rôles autorisés
const ALLOWED_ROLES = [
  'customer',
  'admin',
  'superadmin',
  'support_agent',
  'support_manager',
  'support_backoffice',
  'deliverer',
] as const;

type UserRole = typeof ALLOWED_ROLES[number];

interface SetCustomClaimsRequest {
  userId: string;
  role: UserRole;
}

export const setCustomClaims = functions.https.onCall(async (data: SetCustomClaimsRequest, context) => {
  // 🔒 SÉCURITÉ 1: Vérifier que l'appelant est authentifié
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      '🚫 Vous devez être connecté pour effectuer cette action.'
    );
  }

  const callerId = context.auth.uid;
  const callerEmail = context.auth.token.email;

  functions.logger.info('setCustomClaims called', {
    callerId,
    callerEmail,
    targetUserId: data.userId,
    targetRole: data.role,
  });

  // 🔒 SÉCURITÉ 2: Vérifier que l'appelant est SUPERADMIN
  const callerClaims = context.auth.token;
  const db = admin.firestore();

  let isSuperadmin = false;

  // Vérifier dans custom claims
  if (callerClaims.role === 'superadmin') {
    isSuperadmin = true;
  } else {
    // Vérifier dans Firestore (fallback)
    const callerDoc = await db.collection('users').doc(callerId).get();
    if (callerDoc.exists && callerDoc.data()?.role === 'superadmin') {
      isSuperadmin = true;
    }
  }

  if (!isSuperadmin) {
    functions.logger.warn('Unauthorized access attempt', {
      callerId,
      callerEmail,
      callerRole: callerClaims.role,
    });
    throw new functions.https.HttpsError(
      'permission-denied',
      '🚫 Seuls les superadmins peuvent modifier les rôles utilisateur.'
    );
  }

  // 🔒 SÉCURITÉ 3: Valider les paramètres
  if (!data.userId || typeof data.userId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      '❌ userId est requis et doit être une chaîne de caractères.'
    );
  }

  if (!data.role || !ALLOWED_ROLES.includes(data.role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `❌ role invalide. Rôles autorisés: ${ALLOWED_ROLES.join(', ')}`
    );
  }

  // 🔒 SÉCURITÉ 4: Vérifier que l'utilisateur cible existe
  let targetUser;
  try {
    targetUser = await admin.auth().getUser(data.userId);
  } catch (error) {
    functions.logger.error('Target user not found', { userId: data.userId, error });
    throw new functions.https.HttpsError(
      'not-found',
      `❌ Utilisateur ${data.userId} introuvable.`
    );
  }

  // 🔒 SÉCURITÉ 5: Empêcher l'auto-promotion (sauf si déjà superadmin)
  if (callerId === data.userId && data.role === 'superadmin' && !isSuperadmin) {
    functions.logger.warn('Self-promotion attempt blocked', {
      callerId,
      callerEmail,
    });
    throw new functions.https.HttpsError(
      'permission-denied',
      '🚫 Vous ne pouvez pas vous auto-promouvoir en superadmin.'
    );
  }

  try {
    // ✅ DÉFINIR LE CUSTOM CLAIM
    await admin.auth().setCustomUserClaims(data.userId, {
      role: data.role,
    });

    // ✅ METTRE À JOUR FIRESTORE (pour cohérence)
    await db.collection('users').doc(data.userId).update({
      role: data.role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('Custom claims set successfully', {
      callerId,
      callerEmail,
      targetUserId: data.userId,
      targetEmail: targetUser.email,
      newRole: data.role,
    });

    return {
      success: true,
      message: `✅ Rôle "${data.role}" attribué avec succès à ${targetUser.email}`,
      userId: data.userId,
      email: targetUser.email,
      role: data.role,
    };
  } catch (error) {
    functions.logger.error('Failed to set custom claims', {
      error,
      userId: data.userId,
      role: data.role,
    });
    throw new functions.https.HttpsError(
      'internal',
      `❌ Erreur lors de la définition du rôle: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});
