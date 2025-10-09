import { collection, query, where, getDocs, limit } from 'firebase/firestore';
// ✅ corrige l'import : ne pas prendre @pizza-king/shared
// ou: import { db } from '@/lib/firebase';
import { db } from '@/lib/firebase'; 
/**
 * Check if an email already exists in Firestore users collection
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

/**
 * Check if a phone number already exists in Firestore users collection
 */
export async function checkPhoneExists(phoneNumber: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', phoneNumber), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking phone:', error);
    return false;
  }
}

/**
 * Check if a user exists in Firebase Auth by email
 */
export async function checkUserExistsInAuth(_email: string): Promise<{
  exists: boolean;
  hasPassword: boolean;
  provider: string | null;
}> {
  try {
    // This will be handled by the actual sign-in attempt
    // Firebase doesn't provide a public API to check user existence for security reasons
    // We'll use the error codes from sign-in attempts instead
    return { exists: false, hasPassword: false, provider: null };
  } catch (error) {
    return { exists: false, hasPassword: false, provider: null };
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; message: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { valid: false, message: "L'email est requis" };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Format d'email invalide" };
  }

  return { valid: true, message: '' };
}

/**
 * Validate phone number format (Central African format)
 */
export function validatePhone(phone: string): { valid: boolean; message: string } {
  // Remove spaces and special characters
  // ✅ garde UNE SEULE version, sans les marqueurs de conflit
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  if (!cleanPhone) {
    return { valid: false, message: 'Le numéro de téléphone est requis' };
  }

  // Check for Central African phone format (+236 or 236 followed by 8 digits)
  const phoneRegex = /^(\+?236|0)?[67]\d{7}$/;

  if (!phoneRegex.test(cleanPhone)) {
    return { valid: false, message: 'Format de téléphone invalide (ex: +236 70 12 34 56)' };
  }

  return { valid: true, message: '' };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  message: string;
  strength: 'weak' | 'medium' | 'strong';
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Le mot de passe doit contenir au moins 8 caractères',
      strength: 'weak',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Le mot de passe doit contenir au moins une majuscule',
      strength: 'weak',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Le mot de passe doit contenir au moins une minuscule',
      strength: 'weak',
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Le mot de passe doit contenir au moins un caractère spécial',
      strength: 'medium',
    };
  }

  // Strong password: has numbers too
  if (/\d/.test(password)) {
    return { valid: true, message: 'Mot de passe fort', strength: 'strong' };
  }

  return { valid: true, message: 'Mot de passe valide', strength: 'medium' };
}
