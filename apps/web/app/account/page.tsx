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
import { Sparkles, Settings, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@pizza-king/shared';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  ProfileHeader,
  OverviewTab,
  SecurityTab,
  SettingsTab,
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
} from '@/components/account';
import { auth, storage } from '@/lib/firebase';
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
            push: preferencesForm.push,
            sms: preferencesForm.sms,
            email: preferencesForm.newsletter,
            whatsapp: preferencesForm.whatsapp,
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

  const handleSendOtp = async (): Promise<boolean> => {
    if (!firebaseUser || !phoneForm.phone) return false;
    if (!ensureRecaptcha()) {
      showFeedback("Vérification indisponible. Rechargez la page.", 'error');
      return false;
    }

    setPhoneSaving(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneForm.phone,
        recaptchaVerifier.current!
      );
      phoneConfirmation.current = confirmation;
      setPhoneForm(prev => ({ ...prev, step: 'verify' }));
      showFeedback("Code SMS envoyé.");
      return true;
    } catch (error: any) {
      console.error(error);
      showFeedback(error?.message ?? "Impossible d'envoyer le code.", 'error');
      return false;
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleVerifyOtp = async (): Promise<boolean> => {
    if (!firebaseUser || !phoneConfirmation.current || !phoneForm.code) return false;
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
      return true;
    } catch (error: any) {
      console.error(error);
      showFeedback(error?.message ?? 'Code invalide.', 'error');
      return false;
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
            fileInputRef={fileInputRef}
            onPhotoClick={handlePhotoClick}
            onPhotoChange={handlePhotoChange}
            onSendVerificationEmail={() => {
              void handleSendVerificationEmail();
            }}
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
              photoURL={firebaseUser?.photoURL}
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
            <AccountStats user={user} />
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
