/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Settings, Shield, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  ProfileHeader,
  OverviewTab,
  SecurityTab,
  SettingsTab,
  AddressesTab,
  AccountStats,
  AccountNavigation,
  FeedbackMessage,
  MobileProfileHeader,
  MobileTabs,
  extractPreferences,
  type TabId,
  type Feedback,
  type ProfileForm,
  type PreferencesForm,
  type EmailForm,
  type PhoneForm,
  type AccountStatsSnapshot,
} from '@/components/account';
import { auth, storage } from '@/lib/firebase';
import { checkPhoneExists, getUserByPhone } from '@/lib/auth/validation';
import { useNavLoading } from '@/hooks/useNavLoading';
import {
  updateProfile as updateFirebaseProfile,
  updateEmail as updateFirebaseEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  updatePhoneNumber,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { ConfirmationResult } from 'firebase/auth';

const PHONE_RECAPTCHA_ID = 'account-phone-recaptcha';

const tabs: Array<{ id: TabId; name: string; icon: React.ElementType }> = [
  { id: 'overview', name: 'Aperçu', icon: Sparkles },
  { id: 'addresses', name: 'Adresses', icon: MapPin },
  { id: 'settings', name: 'Paramètres', icon: Settings },
  { id: 'security', name: 'Sécurité', icon: Shield },
];

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    firebaseUser,
    loading: authLoading,
    updateUserProfile,
    signOut,
  } = useAuth();

  const { start: startNavLoading, stop: stopNavLoading } = useNavLoading();

  const userId = user?.id ?? null;
  const userTotalOrders = user?.totalOrders ?? 0;
  const userTotalSpent = user?.totalSpent ?? 0;
  const userFavoriteCount = user?.stats?.favoriteProducts?.length ?? 0;

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const phoneConfirmation = useRef<ConfirmationResult | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [preferencesForm, setPreferencesForm] = useState<PreferencesForm>({
    newsletter: false,
    push: false,
    sms: false,
    whatsapp: false,
  });

  const [emailForm, setEmailForm] = useState<EmailForm>({
    value: '',
    newEmail: '',
  });

  const [phoneForm, setPhoneForm] = useState<PhoneForm>({
    phone: '',
    code: '',
    step: 'idle',
  });

  const statsCacheKey = useMemo(
    () => (userId ? `account_stats_cache_${userId}` : null),
    [userId],
  );

  const initialUserStats = useMemo<AccountStatsSnapshot | null>(() => {
    if (!userId) {
      return null;
    }

    const totalOrders = userTotalOrders;
    const totalSpent = userTotalSpent;
    const averageOrderValue =
      totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      favoriteCount: userFavoriteCount,
      lastOrderAt: null,
    };
  }, [userFavoriteCount, userId, userTotalOrders, userTotalSpent]);

  const initialCachedStats = useMemo<AccountStatsSnapshot | null>(() => {
    if (!statsCacheKey || typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(statsCacheKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Partial<AccountStatsSnapshot>;
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      return {
        totalOrders: Number(parsed.totalOrders) || 0,
        totalSpent: Number(parsed.totalSpent) || 0,
        averageOrderValue: Number(parsed.averageOrderValue) || 0,
        favoriteCount: Number(parsed.favoriteCount) || 0,
        lastOrderAt:
          typeof parsed.lastOrderAt === 'string' ? parsed.lastOrderAt : null,
      };
    } catch (error) {
      console.error('Failed to parse account stats cache:', error);
      return null;
    }
  }, [statsCacheKey]);

  const [accountStats, setAccountStats] =
    useState<AccountStatsSnapshot | null>(initialCachedStats ?? initialUserStats);
  const accountStatsRef = useRef<AccountStatsSnapshot | null>(
    initialCachedStats ?? initialUserStats,
  );
  const currentStatsUserIdRef = useRef<string | null>(user?.id ?? null);
  const [statsReady, setStatsReady] = useState<boolean>(
    initialCachedStats !== null,
  );
  const statsReadyRef = useRef(initialCachedStats !== null);

  const derivedUserStats: AccountStatsSnapshot = initialUserStats ?? {
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    favoriteCount: 0,
    lastOrderAt: null,
  };
  const effectiveStats = accountStats ?? derivedUserStats;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?redirect=/account');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phoneNumber: user.phoneNumber ?? firebaseUser?.phoneNumber ?? '',
      });
      setPreferencesForm(extractPreferences(user.preferences));
      setEmailForm({
        value: user.email ?? firebaseUser?.email ?? '',
        newEmail: '',
      });
      setPhoneForm({
        phone: user.phoneNumber ?? firebaseUser?.phoneNumber ?? '',
        code: '',
        step: 'idle',
      });
    }
  }, [user, firebaseUser]);

  useEffect(() => {
    if (!userId) {
      setAccountStats(null);
      accountStatsRef.current = null;
      setStatsReady(false);
      currentStatsUserIdRef.current = null;
      return;
    }

    const sameUser = currentStatsUserIdRef.current === userId;

    if (!sameUser) {
      if (initialCachedStats) {
        setAccountStats(initialCachedStats);
        accountStatsRef.current = initialCachedStats;
        setStatsReady(true);
      } else if (initialUserStats) {
        setAccountStats(initialUserStats);
        accountStatsRef.current = initialUserStats;
        setStatsReady(false);
      } else {
        setAccountStats(null);
        accountStatsRef.current = null;
        setStatsReady(false);
      }
      currentStatsUserIdRef.current = userId;
      return;
    }

    setAccountStats(prev => {
      if (!prev) {
        const fallback = initialUserStats ?? {
          totalOrders: userTotalOrders,
          totalSpent: userTotalSpent,
          averageOrderValue:
            userTotalOrders > 0 ? userTotalSpent / userTotalOrders : 0,
          favoriteCount: userFavoriteCount,
          lastOrderAt: null,
        };
        return fallback;
      }

      return {
        ...prev,
        favoriteCount:
          userFavoriteCount ?? prev.favoriteCount ?? 0,
      };
    });
  }, [
    user,
    initialCachedStats,
    initialUserStats,
    userFavoriteCount,
    userId,
    userTotalOrders,
    userTotalSpent,
  ]);

  const ensureRecaptcha = (): boolean => {
    if (typeof window === 'undefined') return false;

    if (!recaptchaVerifier.current) {
      let container = document.getElementById(PHONE_RECAPTCHA_ID);
      if (!container) {
        container = document.createElement('div');
        container.id = PHONE_RECAPTCHA_ID;
        container.style.display = 'none';
        document.body.appendChild(container);
      }

      try {
        recaptchaVerifier.current = new RecaptchaVerifier(
          auth,
          PHONE_RECAPTCHA_ID,
          {
            size: 'invisible',
          }
        );
      } catch (error) {
        console.error('Failed to initialize phone Recaptcha:', error);
        recaptchaVerifier.current = null;
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    ensureRecaptcha();

    return () => {
      recaptchaVerifier.current?.clear();
      recaptchaVerifier.current = null;
      const container = document.getElementById(PHONE_RECAPTCHA_ID);
      container?.remove();
    };
  }, []);

  useEffect(() => {
    statsReadyRef.current = statsReady;
  }, [statsReady]);

  useEffect(() => {
    accountStatsRef.current = accountStats;
    if (accountStats && userId) {
      currentStatsUserIdRef.current = userId;
    }
  }, [accountStats, userId]);

  useEffect(() => {
    if (!statsCacheKey || typeof window === 'undefined') {
      return;
    }

    if (
      statsReadyRef.current &&
      accountStatsRef.current &&
      currentStatsUserIdRef.current === userId
    ) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(statsCacheKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<AccountStatsSnapshot> & {
        cachedAt?: number;
      };

      if (!parsed || typeof parsed !== 'object') {
        return;
      }

      const cachedStats: AccountStatsSnapshot = {
        totalOrders: Number(parsed.totalOrders) || 0,
        totalSpent: Number(parsed.totalSpent) || 0,
        averageOrderValue: Number(parsed.averageOrderValue) || 0,
        favoriteCount: Number(parsed.favoriteCount) || 0,
        lastOrderAt: typeof parsed.lastOrderAt === 'string' ? parsed.lastOrderAt : null,
      };

      setAccountStats(cachedStats);
      accountStatsRef.current = cachedStats;
      currentStatsUserIdRef.current = userId;
      setStatsReady(true);
    } catch (error) {
      console.error('Failed to read account stats cache:', error);
    }
  }, [statsCacheKey, userId]);

  useEffect(() => {
    let isMounted = true;
    let didStartLoading = false;
    let completed = false;

    const fetchAccountStats = async () => {
      if (!firebaseUser || !userId) {
        return;
      }

      didStartLoading = true;
      startNavLoading();

      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch('/api/account/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch account stats (${response.status})`);
        }

        const data = (await response.json()) as {
          totalOrders?: number;
          totalSpent?: number;
          averageOrderValue?: number;
          lastOrderAt?: string | null;
        };

        if (!isMounted) {
          completed = true;
          return;
        }

        const previousStats = accountStatsRef.current;
        const updatedStats: AccountStatsSnapshot = {
          totalOrders:
            typeof data.totalOrders === 'number'
              ? data.totalOrders
              : previousStats?.totalOrders ?? userTotalOrders,
          totalSpent:
            typeof data.totalSpent === 'number'
              ? data.totalSpent
              : previousStats?.totalSpent ?? userTotalSpent,
          averageOrderValue:
            typeof data.averageOrderValue === 'number'
              ? data.averageOrderValue
              : previousStats?.averageOrderValue ??
                (typeof data.totalOrders === 'number' &&
                typeof data.totalSpent === 'number' &&
                data.totalOrders > 0
                  ? data.totalSpent / data.totalOrders
                  : previousStats?.averageOrderValue ??
                    (userTotalOrders > 0
                      ? userTotalSpent / userTotalOrders
                      : 0)),
          favoriteCount:
            userFavoriteCount ??
            previousStats?.favoriteCount ??
            0,
          lastOrderAt: data.lastOrderAt ?? previousStats?.lastOrderAt ?? null,
        };

        setAccountStats(updatedStats);
        accountStatsRef.current = updatedStats;
        currentStatsUserIdRef.current = userId;
        setStatsReady(true);

        if (statsCacheKey && typeof window !== 'undefined') {
          window.localStorage.setItem(
            statsCacheKey,
            JSON.stringify({
              ...updatedStats,
              cachedAt: Date.now(),
            }),
          );
        }

        completed = true;
      } catch (error) {
        console.error('Failed to load account stats:', error);
        if (isMounted && !statsReadyRef.current) {
          setStatsReady(true);
        }
      } finally {
        if (didStartLoading) {
          stopNavLoading();
        }
        if (!completed && isMounted && !statsReadyRef.current) {
          setStatsReady(true);
        }
      }
    };

    void fetchAccountStats();

    return () => {
      isMounted = false;
      if (didStartLoading && !completed) {
        stopNavLoading();
      }
    };
  }, [
    firebaseUser,
    startNavLoading,
    statsCacheKey,
    stopNavLoading,
    userFavoriteCount,
    userId,
    userTotalOrders,
    userTotalSpent,
  ]);

  const showFeedback = (
    message: string,
    type: Feedback['type'] = 'success'
  ) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  };

  const isGoogleProvider = useMemo(
    () =>
      firebaseUser?.providerData?.some(
        provider => provider.providerId === 'google.com'
      ) ?? false,
    [firebaseUser?.providerData]
  );

  const isPasswordProvider = useMemo(
    () =>
      firebaseUser?.providerData?.some(
        provider => provider.providerId === 'password'
      ) ?? false,
    [firebaseUser?.providerData]
  );

  const emailVerified = useMemo(
    () => Boolean(isGoogleProvider || firebaseUser?.emailVerified),
    [isGoogleProvider, firebaseUser?.emailVerified]
  );

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!firebaseUser || !event.target.files?.length) return;
    const file = event.target.files[0];
    setPhotoLoading(true);
    try {
      const extension = file.name.split('.').pop();
      const storageRef = ref(
        storage,
        `users/${firebaseUser.uid}/profile.${extension ?? 'jpg'}`
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateFirebaseProfile(firebaseUser, { photoURL: downloadURL });
      await updateUserProfile({
        photoURL: downloadURL,
      });

      showFeedback('Photo de profil mise à jour avec succès');
    } catch (error: any) {
      console.error(error);
      showFeedback(
        error?.message ?? 'Impossible de mettre à jour la photo',
        'error'
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseUser || !user) return;

    setProfileSaving(true);
    try {
      const displayName =
        `${profileForm.firstName} ${profileForm.lastName}`.trim() ||
        user.displayName;
      await updateFirebaseProfile(firebaseUser, { displayName });

      await updateUserProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phoneNumber: profileForm.phoneNumber,
        displayName,
        preferences: {
          ...user.preferences,
          newsletter: preferencesForm.newsletter,
          notifications: {
            ...user.preferences?.notifications,
            push: preferencesForm.push,
            sms: preferencesForm.sms,
            whatsapp: preferencesForm.whatsapp,
            email:
              user.preferences?.notifications?.email ??
              preferencesForm.newsletter,
          },
        },
      });

      showFeedback('Profil mis à jour.');
    } catch (error: any) {
      console.error(error);
      showFeedback(
        error?.message ?? 'Erreur lors de la mise à jour du profil',
        'error'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleEmailUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseUser || !emailForm.newEmail) return;
    setEmailSaving(true);
    try {
      await updateFirebaseEmail(firebaseUser, emailForm.newEmail);
      await sendEmailVerification(firebaseUser);
      await updateUserProfile({
        email: emailForm.newEmail,
      });
      setEmailForm({ value: emailForm.newEmail, newEmail: '' });
      showFeedback('Adresse email mise à jour. Vérifiez votre boîte mail.');
    } catch (error: any) {
      console.error(error);
      let message = error?.message ?? 'Impossible de mettre à jour votre email';
      if (error?.code === 'auth/requires-recent-login') {
        message = 'Veuillez vous reconnecter pour mettre à jour votre email.';
      }
      showFeedback(message, 'error');
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSendVerificationEmail = async (): Promise<boolean> => {
    if (!firebaseUser) return false;
    if (isGoogleProvider || emailVerified) {
      showFeedback("Votre adresse email est déjà vérifiée.");
      return false;
    }
    try {
      await sendEmailVerification(firebaseUser);
      showFeedback("Email de vérification envoyé.");
      return true;
    } catch (error: any) {
      console.error(error);
      showFeedback(
        error?.message ?? "Erreur lors de l'envoi de l'email",
        'error'
      );
      return false;
    }
  };

  const handleSendOtp = async (): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || !phoneForm.phone) {
      return { success: false, error: "Numéro de téléphone manquant." };
    }
    if (!ensureRecaptcha()) {
      const errorMsg = "Vérification indisponible. Rechargez la page.";
      showFeedback(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    setPhoneSaving(true);
    try {
      // Vérifier si le numéro est déjà utilisé par un autre compte
      const trimmedPhone = phoneForm.phone.trim();
      const phoneExists = await checkPhoneExists(trimmedPhone);

      if (phoneExists) {
        // Vérifier si c'est le numéro de l'utilisateur actuel
        const phoneUserDoc = await getUserByPhone(trimmedPhone);
        const phoneUserId = (phoneUserDoc as any)?.id;

        // Si le numéro appartient à un autre utilisateur
        if (phoneUserId && phoneUserId !== firebaseUser.uid) {
          const errorMsg = "Ce numéro de téléphone est déjà associé à un autre compte. Veuillez utiliser un autre numéro.";
          showFeedback(errorMsg, 'error');
          return { success: false, error: errorMsg };
        }
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneForm.phone,
        recaptchaVerifier.current!
      );
      phoneConfirmation.current = confirmation;
      setPhoneForm(prev => ({ ...prev, step: 'verify' }));
      showFeedback("Code SMS envoyé.");
      return { success: true };
    } catch (error: any) {
      console.error(error);

      // Traduire les erreurs Firebase en messages clairs
      let errorMsg = "Impossible d'envoyer le code.";
      const errorCode = error?.code || '';

      switch (errorCode) {
        case 'auth/invalid-phone-number':
          errorMsg = "Le numéro de téléphone est invalide. Vérifiez le format (ex: +33612345678).";
          break;
        case 'auth/missing-phone-number':
          errorMsg = "Veuillez saisir un numéro de téléphone.";
          break;
        case 'auth/quota-exceeded':
          errorMsg = "Trop de tentatives. Veuillez réessayer plus tard.";
          break;
        case 'auth/user-disabled':
          errorMsg = "Votre compte a été désactivé. Contactez le support.";
          break;
        case 'auth/operation-not-allowed':
          errorMsg = "L'authentification par téléphone n'est pas activée.";
          break;
        case 'auth/too-many-requests':
          errorMsg = "Trop de demandes. Veuillez patienter quelques minutes.";
          break;
        default:
          // Si le message contient "too long" ou "invalid"
          if (error?.message?.toLowerCase().includes('too long') ||
              error?.message?.toLowerCase().includes('invalid')) {
            errorMsg = "Le numéro de téléphone saisi n'est pas valide. Utilisez le format international (ex: +33612345678).";
          } else if (error?.message) {
            errorMsg = error.message;
          }
      }

      showFeedback(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleVerifyOtp = async (): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || !phoneConfirmation.current || !phoneForm.code) {
      return { success: false, error: "Veuillez saisir le code SMS reçu." };
    }
    setPhoneSaving(true);
    try {
      const credential = PhoneAuthProvider.credential(
        phoneConfirmation.current.verificationId,
        phoneForm.code
      );
      await updatePhoneNumber(firebaseUser, credential);
      await updateUserProfile({
        phoneNumber: phoneForm.phone,
        phoneVerified: true,
      });
      phoneConfirmation.current = null;
      setPhoneForm(prev => ({ ...prev, code: '', step: 'idle' }));
      showFeedback('Numéro de téléphone vérifié.');
      return { success: true };
    } catch (error: any) {
      console.error(error);

      // Traduire les erreurs Firebase en messages clairs
      let errorMsg = 'Code invalide.';
      const errorCode = error?.code || '';

      switch (errorCode) {
        case 'auth/invalid-verification-code':
          errorMsg = "Le code saisi est incorrect. Vérifiez et réessayez.";
          break;
        case 'auth/code-expired':
          errorMsg = "Le code a expiré. Demandez un nouveau code.";
          break;
        case 'auth/missing-verification-code':
          errorMsg = "Veuillez saisir le code SMS reçu.";
          break;
        case 'auth/credential-already-in-use':
          errorMsg = "Ce numéro est déjà utilisé par un autre compte.";
          break;
        case 'auth/requires-recent-login':
          errorMsg = "Veuillez vous reconnecter puis réessayer.";
          break;
        case 'auth/too-many-requests':
          errorMsg = "Trop de tentatives. Veuillez patienter quelques minutes.";
          break;
        default:
          if (error?.message?.toLowerCase().includes('invalid')) {
            errorMsg = "Le code saisi est incorrect. Vérifiez et réessayez.";
          } else if (error?.message?.toLowerCase().includes('expired')) {
            errorMsg = "Le code a expiré. Demandez un nouveau code.";
          } else if (error?.message) {
            errorMsg = error.message;
          }
      }

      showFeedback(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } catch (error: any) {
      console.error(error);
      showFeedback(error?.message ?? 'Erreur lors de la déconnexion', 'error');
    } finally {
      setSigningOut(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin" />
            Chargement du compte…
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="px-4 py-6">
          {feedback && (
            <FeedbackMessage type={feedback.type} message={feedback.message} />
          )}

          <MobileProfileHeader
            user={user}
            emailVerified={emailVerified}
            photoLoading={photoLoading}
            photoURL={firebaseUser?.photoURL ?? user.photoURL ?? null}
            fileInputRef={fileInputRef}
            onPhotoClick={handlePhotoClick}
            onPhotoChange={handlePhotoChange}
            onSendVerificationEmail={() => {
              void handleSendVerificationEmail();
            }}
            stats={effectiveStats}
            statsReady={statsReady}
          />

          <MobileTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="space-y-4">
            {activeTab === 'overview' && (
              <OverviewTab preferences={preferencesForm} />
            )}

            {activeTab === 'addresses' && (
              <AddressesTab />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                user={user}
                profileForm={profileForm}
                preferencesForm={preferencesForm}
                emailVerified={emailVerified}
                phoneVerified={Boolean(user.phoneVerified)}
                onProfileFormChange={updates =>
                  setProfileForm(prev => ({ ...prev, ...updates }))
                }
                onPreferencesChange={updates =>
                  setPreferencesForm(prev => ({ ...prev, ...updates }))
                }
                onSubmit={handleProfileSubmit}
                saving={profileSaving}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab
                user={user}
                isPasswordProvider={isPasswordProvider}
                emailForm={emailForm}
                phoneForm={phoneForm}
                emailSaving={emailSaving}
                phoneSaving={phoneSaving}
                onSendEmailVerification={handleSendVerificationEmail}
                emailVerified={emailVerified}
                phoneVerified={Boolean(user.phoneVerified)}
                onEmailFormChange={updates =>
                  setEmailForm(prev => ({ ...prev, ...updates }))
                }
                onPhoneFormChange={updates =>
                  setPhoneForm(prev => ({ ...prev, ...updates }))
                }
                onEmailUpdate={handleEmailUpdate}
                onSendOtp={handleSendOtp}
                onVerifyOtp={handleVerifyOtp}
              />
            )}
          </div>

          {/* Logout Button Mobile */}
          <div className="mt-6">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Se déconnecter</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          {feedback && (
            <FeedbackMessage type={feedback.type} message={feedback.message} />
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <ProfileHeader
              user={user}
              photoURL={firebaseUser?.photoURL ?? user.photoURL ?? null}
              emailVerified={emailVerified}
              photoLoading={photoLoading}
              fileInputRef={fileInputRef}
              onPhotoClick={handlePhotoClick}
              onPhotoChange={handlePhotoChange}
              onSendVerificationEmail={() => {
                void handleSendVerificationEmail();
              }}
              onManageProfile={() => setActiveTab('settings')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <AccountStats
              user={user}
              stats={effectiveStats}
              loading={!statsReady}
            />
          </motion.div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="lg:w-60">
              <AccountNavigation
                tabs={tabs}
                activeTab={activeTab}
                signingOut={signingOut}
                onTabChange={setActiveTab}
                onSignOut={handleSignOut}
              />
            </div>

            <div className="flex-1">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <OverviewTab preferences={preferencesForm} />
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <AddressesTab />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <SettingsTab
                    user={user}
                    profileForm={profileForm}
                    preferencesForm={preferencesForm}
                    emailVerified={emailVerified}
                    phoneVerified={Boolean(user.phoneVerified)}
                    onProfileFormChange={updates =>
                      setProfileForm(prev => ({ ...prev, ...updates }))
                    }
                    onPreferencesChange={updates =>
                      setPreferencesForm(prev => ({ ...prev, ...updates }))
                    }
                    onSubmit={handleProfileSubmit}
                    saving={profileSaving}
                  />
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <SecurityTab
                    user={user}
                    isPasswordProvider={isPasswordProvider}
                    emailForm={emailForm}
                    phoneForm={phoneForm}
                    emailSaving={emailSaving}
                    phoneSaving={phoneSaving}
                    onSendEmailVerification={handleSendVerificationEmail}
                    emailVerified={emailVerified}
                    phoneVerified={Boolean(user.phoneVerified)}
                    onEmailFormChange={updates =>
                      setEmailForm(prev => ({ ...prev, ...updates }))
                    }
                    onPhoneFormChange={updates =>
                      setPhoneForm(prev => ({ ...prev, ...updates }))
                    }
                    onEmailUpdate={handleEmailUpdate}
                    onSendOtp={handleSendOtp}
                    onVerifyOtp={handleVerifyOtp}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

