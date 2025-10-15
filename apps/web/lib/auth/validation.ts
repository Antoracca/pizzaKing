import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    throw new Error('Impossible de vérifier le numéro de téléphone. Réessayez plus tard.');
  }
}

export function validateEmail(email: string): { valid: boolean; message: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) return { valid: false, message: "L'email est requis" };
  if (!emailRegex.test(email)) return { valid: false, message: "Format d'email invalide" };

  return { valid: true, message: '' };
}

export function validatePhone(phone: string): { valid: boolean; message: string } {
  if (!phone?.trim()) {
    return { valid: false, message: 'Le numéro de téléphone est requis' };
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
