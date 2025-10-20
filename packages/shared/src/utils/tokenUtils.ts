/**
 * Utilitaires pour gérer les tokens JWT Firebase
 */

/**
 * Décoder un JWT et extraire le payload
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
}

/**
 * Vérifier si un utilisateur Firebase a un custom claim 'role'
 */
export async function hasRoleClaim(user: any): Promise<boolean> {
  try {
    const token = await user.getIdToken(false); // Ne pas forcer le refresh encore
    const payload = decodeJWT(token);
    return !!payload?.role;
  } catch {
    return false;
  }
}

/**
 * Attendre qu'un custom claim soit ajouté au token
 * Vérifie toutes les 500ms pendant max 10 secondes
 *
 * @returns true si le claim a été détecté, false si timeout
 */
export async function waitForRoleClaim(user: any): Promise<boolean> {
  console.log('⏳ Démarrage du polling pour le custom claim...');

  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Force refresh du token à chaque tentative
    await user.getIdToken(true);

    if (await hasRoleClaim(user)) {
      const duration = ((i + 1) * 0.5).toFixed(1);
      console.log(`✅ Custom claim détecté après ${duration} secondes`);
      return true;
    }
  }

  console.warn('⚠️ Custom claim non détecté après 10 secondes');
  return false;
}
