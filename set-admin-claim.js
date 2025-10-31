#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * 🔐 SCRIPT POUR DÉFINIR LE CUSTOM CLAIM SUPERADMIN
 *
 * Ce script définit le custom claim "role: superadmin" pour votre utilisateur
 * afin que vous ayez TOUTES les autorisations pour les tests.
 *
 * Usage:
 *   node set-admin-claim.js
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require('firebase-admin');

// Votre UID superadmin (votre compte actuel)
const SUPERADMIN_UID = 'h0yuQqBO5XNada6UiiblfuY1Og23';

console.log('🔥 Configuration du custom claim SUPERADMIN...\n');

// Initialiser Firebase Admin
admin.initializeApp({
  projectId: 'pizzaking-e99b1',
});

async function setSuperadminClaim() {
  try {
    console.log(`👤 Utilisateur cible: ${SUPERADMIN_UID}`);

    // Récupérer l'utilisateur
    const user = await admin.auth().getUser(SUPERADMIN_UID);
    console.log(`📧 Email: ${user.email}`);
    console.log(`📝 Nom: ${user.displayName || 'N/A'}`);

    // Définir le custom claim SUPERADMIN
    await admin.auth().setCustomUserClaims(SUPERADMIN_UID, {
      role: 'superadmin',
    });

    console.log('\n✅ Custom claim SUPERADMIN défini avec succès!');
    console.log('   Role: superadmin');
    console.log('   🔥 TOUTES LES AUTORISATIONS ACTIVÉES');

    // Mettre à jour Firestore aussi (pour cohérence)
    const db = admin.firestore();
    await db.collection('users').doc(SUPERADMIN_UID).update({
      role: 'superadmin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Document Firestore mis à jour!');

    console.log('\n🎯 IMPORTANT:');
    console.log('   1. Déconnectez-vous de votre application');
    console.log('   2. Reconnectez-vous');
    console.log('   3. Vous aurez TOUS LES DROITS!');
    console.log('\n✨ Terminé!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   1. Les credentials Firebase sont configurés');
    console.error('   2. L\'UID est correct');
    console.error('   3. Le projet Firebase est accessible');
    process.exit(1);
  }
}

setSuperadminClaim();
