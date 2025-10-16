import {
  collection,
  query,
  where,
  getDocs,
  limit,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isValidPhoneNumber } from 'react-phone-number-input';

export async function checkEmailExists(email: string): Promise<boolean> {
  const trimmed = email.trim();
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', trimmed), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('checkEmailExists failed:', error);
    throw new Error("Impossible de vérifier l'email. Réessayez plus tard.");
  }
}

export async function checkPhoneExists(phoneNumber: string): Promise<boolean> {
  const trimmed = phoneNumber.trim();
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', trimmed), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('checkPhoneExists failed:', error);
    throw new Error(
      'Impossible de vérifier le numéro de téléphone. Réessayez plus tard.'
    );
  }
}

/**
 * Returns the first user document matching the given phone number.
 * Useful for phone-based login flows to map phone -> account data.
 */
export async function getUserByPhone(
  phoneNumber: string
): Promise<DocumentData | null> {
  const trimmed = phoneNumber.trim();
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', trimmed), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  } catch (error) {
    console.error('getUserByPhone failed:', error);
    throw new Error(
      "Impossible de récupérer l'utilisateur par téléphone. Réessayez plus tard."
    );
  }
}

/**
 * Convenience helper to fetch the email associated to a phone number.
 * Returns null if no user found or no email present on the document.
 */
export async function getEmailByPhone(
  phoneNumber: string
): Promise<string | null> {
  const user = await getUserByPhone(phoneNumber);
  if (!user) return null;
  const email = (user as { email?: string } | null)?.email;
  return email?.trim() || null;
}

export async function getUserByEmail(
  email: string
): Promise<DocumentData | null> {
  const trimmed = email.trim();
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', trimmed), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  } catch (error) {
    console.error('getUserByEmail failed:', error);
    throw new Error(
      "Impossible de récupérer l'utilisateur par email. Réessayez plus tard."
    );
  }
}

export async function checkIsGoogleUser(email: string): Promise<boolean> {
  const trimmed = email.trim();
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', trimmed), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return false;

    const data = snapshot.docs[0].data();
    return data.provider === 'google' && data.hasPassword === false;
  } catch (error) {
    console.error('checkIsGoogleUser failed:', error);
    throw new Error(
      'Impossible de vérifier le type de compte. Réessayez plus tard.'
    );
  }
}

export function validateEmail(email: string): {
  valid: boolean;
  message: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) return { valid: false, message: "L'email est requis" };
  if (!emailRegex.test(email))
    return { valid: false, message: "Format d'email invalide" };

  return { valid: true, message: '' };
}

export function validatePhone(phone: string): {
  valid: boolean;
  message: string;
} {
  const value = phone?.trim() || '';
  if (!value) {
    return { valid: false, message: 'Le numéro de téléphone est requis' };
  }

  // Validate against E.164 format and country-specific rules using libphonenumber
  try {
    if (!isValidPhoneNumber(value)) {
      return {
        valid: false,
        message: 'Format de numéro invalide pour le pays sélectionné',
      };
    }
  } catch {
    return {
      valid: false,
      message: 'Numéro invalide. Vérifiez le pays et le format',
    };
  }

  return { valid: true, message: '' };
}

export function validatePassword(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { valid: false, message: 'Au moins 8 caractères requis' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Incluez au moins une majuscule' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Incluez au moins une minuscule' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Incluez au moins un chiffre' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Incluez au moins un caractère spécial' };
  }

  return { valid: true, message: '' };
}
