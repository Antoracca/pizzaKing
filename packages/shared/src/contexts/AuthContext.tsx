'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Firestore, Timestamp } from 'firebase/firestore';
import { User, UserRole } from '../types/user';
import { COLLECTIONS } from '../constants/collections';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    options?: { allowUnverifiedEmail?: boolean }
  ) => Promise<void>;
  resendEmailVerification: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isDeliverer: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  auth: Auth;
  db: Firestore;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  auth,
  db,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user data from Firestore
   */
  const fetchUserData = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  /**
   * Create user document in Firestore
   */
  const createUserDocument = async (
    uid: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    provider: 'password' | 'google' = 'password'
  ): Promise<void> => {
    const now = Timestamp.now();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const displayName = `${firstName} ${lastName}`.trim() || trimmedEmail;

    const baseData: Omit<User, 'id'> = {
      email: trimmedEmail,
      phoneNumber: trimmedPhone,
      displayName,
      firstName,
      lastName,
      role: 'customer',
      status: provider === 'password' ? 'pending' : 'active',
      loyaltyPoints: 0,
      loyaltyTier: 'bronze',
      totalSpent: 0,
      totalOrders: 0,
      preferences: {
        notifications: {
          push: true,
          sms: false,
          email: true,
          whatsapp: false,
        },
        language: 'fr',
        newsletter: true,
      },
      referralCode: `PK${uid.substring(0, 8).toUpperCase()}`,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      provider,
      hasPassword: provider === 'password',
      emailVerified: provider === 'google',
      phoneVerified: false,
    };

    try {
      await setDoc(userRef, {
        id: uid,
        ...baseData,
      });
    } catch (error) {
      console.error('Failed to create user document:', error);
      throw new Error('Impossible de sauvegarder le profil utilisateur.');
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (
    email: string,
    password: string,
    options?: { allowUnverifiedEmail?: boolean }
  ): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const current = auth.currentUser;
      if (current && !current.emailVerified && !options?.allowUnverifiedEmail) {
        try {
          await sendEmailVerification(current);
        } catch (verificationError) {
          console.error(
            'Failed to resend verification email:',
            verificationError
          );
        }

        await firebaseSignOut(auth);

        const error: any = new Error(
          "Votre email n'est pas encore vérifié. Un lien de confirmation vient d'être renvoyé."
        );
        error.code = 'auth/email-not-verified';
        throw error;
      }
    } catch (error: any) {
      const err: any = new Error(
        error?.message || 'Erreur lors de la connexion'
      );
      if (error?.code) err.code = error.code;
      throw err;
    }
  };

  const resendEmailVerification = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
    } catch (error: any) {
      const err: any = new Error(
        error?.message || "Impossible d'envoyer l'email de vérification"
      );
      if (error?.code) err.code = error.code;
      throw err;
    } finally {
      await firebaseSignOut(auth);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string
  ): Promise<void> => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Send email verification to the new user
      try {
        await sendEmailVerification(firebaseUser);
      } catch (verificationError) {
        // Non-blocking: log but do not fail signup if email send fails
        console.error('Failed to send verification email:', verificationError);
      }

      // Create Firestore document
      await createUserDocument(
        firebaseUser.uid,
        email,
        firstName,
        lastName,
        phoneNumber
      );
    } catch (error: any) {
      // Attempt to clean up partially created auth user
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await currentUser.delete();
        }
      } catch (cleanupError) {
        console.error(
          'Failed to cleanup auth user after signup error:',
          cleanupError
        );
      }

      throw new Error(error.message || "Erreur lors de l'inscription");
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      // Utiliser signInWithPopup (fonctionne avec localhost)
      const result = await signInWithPopup(auth, provider);

      // Check if user document exists
      const userData = await fetchUserData(result.user.uid);

      if (!userData) {
        // Create user document if it doesn't exist
        const names = result.user.displayName?.split(' ') || ['', ''];
        const firstName = names[0] || 'Utilisateur';
        const lastName = names.slice(1).join(' ') || 'Google';

        await createUserDocument(
          result.user.uid,
          result.user.email || '',
          firstName,
          lastName,
          result.user.phoneNumber || '',
          'google'
        );
      }

      // User will be handled by onAuthStateChanged
    } catch (error: any) {
      throw new Error(
        error.message || 'Erreur lors de la connexion avec Google'
      );
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la déconnexion');
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(
        error.message || 'Erreur lors de la réinitialisation du mot de passe'
      );
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      await setDoc(
        doc(db, COLLECTIONS.USERS, user.id),
        {
          ...updates,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      // Update local state
      setUser({ ...user, ...updates });
    } catch (error: any) {
      throw new Error(
        error.message || 'Erreur lors de la mise à jour du profil'
      );
    }
  };

  /**
   * Check if user has specific role(s)
   */
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  /**
   * Auth state listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user data from Firestore
        const userData = await fetchUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    resendEmailVerification,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    hasRole,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isDeliverer: user?.role === 'deliverer',
    isCustomer: user?.role === 'customer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
