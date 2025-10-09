import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { User, UserRole } from '../types/user';
import { COLLECTIONS } from '../constants/collections';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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
    const userData: Omit<User, 'id'> = {
      email,
      phoneNumber,
      firstName,
      lastName,
      role: 'customer',
      isEmailVerified: false,
      isPhoneVerified: false,
      loyaltyPoints: 0,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, COLLECTIONS.USERS, uid), {
      id: uid,
      ...userData,
      provider,
      hasPassword: provider === 'password',
    });
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la connexion');
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

      // Create Firestore document
      await createUserDocument(
        firebaseUser.uid,
        email,
        firstName,
        lastName,
        phoneNumber
      );
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de l'inscription");
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);

      // Check if user document exists
      const userData = await fetchUserData(firebaseUser.uid);

      if (!userData) {
        // Create user document if it doesn't exist
        const names = firebaseUser.displayName?.split(' ') || ['', ''];
        await createUserDocument(
          firebaseUser.uid,
          firebaseUser.email || '',
          names[0],
          names.slice(1).join(' '),
          firebaseUser.phoneNumber || '',
          'google'
        );
      }
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
          updatedAt: new Date(),
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
