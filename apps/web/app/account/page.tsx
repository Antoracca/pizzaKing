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
import {
  User as UserIcon,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Award,
  Settings,
  Shield,
  LogOut,
  Upload,
  Mail,
  CheckCircle,
  Loader2,
  CalendarClock,
  Bell,
} from 'lucide-react';
import { useAuth } from '@pizza-king/shared';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPrice } from '@/lib/utils';
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

type TabId = 'overview' | 'settings' | 'security';

type Feedback = { type: 'success' | 'error'; message: string };

const tabs: Array<{ id: TabId; name: string; icon: React.ElementType }> = [
  { id: 'overview', name: 'Aperçu', icon: Sparkles },
  { id: 'settings', name: 'Paramètres', icon: Settings },
  { id: 'security', name: 'Sécurité', icon: Shield },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractPreferences = (prefs: any) => {
  if (!prefs) {
    return {
      newsletter: true,
      push: true,
      sms: false,
      whatsapp: false,
    };
  }

  const notifications = prefs.notifications ?? {};

  return {
    newsletter: prefs.newsletter ?? notifications.email ?? false,
    push: prefs.pushNotifications ?? notifications.push ?? false,
    sms: prefs.smsNotifications ?? notifications.sms ?? false,
    whatsapp: prefs.whatsappNotifications ?? notifications.whatsapp ?? false,
  };
};

const formatPhone = (raw?: string | null) => {
  if (!raw) return 'Non renseigné';
  return raw.replace(/\s+/g, '');
};
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

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [preferencesForm, setPreferencesForm] = useState({
    newsletter: true,
    push: true,
    sms: false,
    whatsapp: false,
  });

  const [emailForm, setEmailForm] = useState({
    value: '',
    newEmail: '',
  });

  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    code: '',
    step: 'idle' as 'idle' | 'verify',
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!recaptchaVerifier.current) {
      try {
        recaptchaVerifier.current = new RecaptchaVerifier(
          auth,
          'phone-recaptcha',
          {
            size: 'invisible',
          }
        );
      } catch (error) {
        // ignored
      }
    }

    return () => {
      recaptchaVerifier.current?.clear();
      recaptchaVerifier.current = null;
    };
  }, []);

  const stats = useMemo(() => {
    if (!user) return [];

    return [
      {
        label: 'Commandes',
        value: user.totalOrders ?? 0,
        icon: ShoppingBag,
        color: 'text-blue-600',
        background: 'bg-blue-50',
      },
      {
        label: 'Points fidélité',
        value: user.loyaltyPoints ?? 0,
        icon: Award,
        color: 'text-orange-600',
        background: 'bg-orange-50',
      },
      {
        label: 'Dépensé',
        value: formatPrice(user.totalSpent ?? 0),
        icon: TrendingUp,
        color: 'text-emerald-600',
        background: 'bg-emerald-50',
      },
      {
        label: 'Favoris',
        value: user.stats?.favoriteProducts?.length ?? 0,
        icon: Sparkles,
        color: 'text-purple-600',
        background: 'bg-purple-50',
      },
    ];
  }, [user]);

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

  const handleSendVerificationEmail = async () => {
    if (!firebaseUser || isGoogleProvider) {
      showFeedback('Votre adresse email Google est déjà vérifiée.');
      return;
    }
    try {
      await sendEmailVerification(firebaseUser);
      showFeedback('Email de vérification envoyé.');
    } catch (error: any) {
      console.error(error);
      showFeedback(
        error?.message ?? 'Erreur lors de l’envoi de l’email',
        'error'
      );
    }
  };

  const handleSendOtp = async () => {
    if (!firebaseUser || !phoneForm.phone) return;
    if (!recaptchaVerifier.current) {
      showFeedback('Vérification indisponible. Rechargez la page.', 'error');
      return;
    }

    setPhoneSaving(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneForm.phone,
        recaptchaVerifier.current
      );
      phoneConfirmation.current = confirmation;
      setPhoneForm(prev => ({ ...prev, step: 'verify' }));
      showFeedback('Code SMS envoyé.');
    } catch (error: any) {
      console.error(error);
      showFeedback(error?.message ?? 'Impossible d’envoyer le code.', 'error');
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseUser || !phoneConfirmation.current || !phoneForm.code) return;
    setPhoneSaving(true);
    try {
      const credential = PhoneAuthProvider.credential(
        phoneConfirmation.current.verificationId,
        phoneForm.code
      );
      await updatePhoneNumber(firebaseUser, credential);
      await updateUserProfile({
        phoneNumber: phoneForm.phone,
      });
      phoneConfirmation.current = null;
      setPhoneForm(prev => ({ ...prev, code: '', step: 'idle' }));
      showFeedback('Numéro de téléphone vérifié.');
    } catch (error: any) {
      console.error(error);
      showFeedback(error?.message ?? 'Code invalide.', 'error');
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push('/');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <div
              className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Header Profile Mobile */}
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-orange-400 bg-gradient-to-br from-orange-400 to-red-500 text-lg font-bold text-white shadow-md">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName ?? 'Photo de profil'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-white" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white p-0 text-gray-700 shadow hover:bg-gray-100"
                  onClick={handlePhotoClick}
                  disabled={photoLoading}
                >
                  {photoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">
                  {user.firstName || user.lastName
                    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                    : (user.displayName ?? 'Compte Pizza King')}
                </h1>
                <p className="text-xs text-gray-600">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  {emailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="h-3 w-3" />
                      Vérifié
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendVerificationEmail}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-200"
                    >
                      Vérifier
                    </button>
                  )}
                  <Badge className="rounded-full bg-orange-50 text-orange-600 border-orange-200">
                    <Award className="h-3 w-3 mr-1" />
                    {user.loyaltyPoints ?? 0} pts
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Mobile Grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-gray-50 p-3 text-center">
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${stat.background}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="mb-6 flex rounded-2xl bg-white p-1 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Mobile Content */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Activité récente */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-lg font-bold text-gray-900">Activité récente</h2>
                  <p className="mb-4 text-sm text-gray-600">Suivez vos commandes et progression fidélité.</p>
                  <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                    Aucune commande récente. Commencez une nouvelle commande !
                  </div>
                </div>

                {/* Préférences notifications */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="mb-2 text-lg font-bold text-gray-900">Notifications</h3>
                  <p className="mb-4 text-sm text-gray-600">Vos préférences de notification actuelles.</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Email', value: preferencesForm.newsletter, description: 'Promotions & nouveautés' },
                      { label: 'Push', value: preferencesForm.push, description: 'Suivi commandes' },
                      { label: 'SMS', value: preferencesForm.sms, description: 'Alertes livraison' },
                      { label: 'WhatsApp', value: preferencesForm.whatsapp, description: 'Support rapide' },
                    ].map(pref => (
                      <div key={pref.label} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
                          <p className="text-xs text-gray-500">{pref.description}</p>
                        </div>
                        <span className={`text-xs font-semibold ${pref.value ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {pref.value ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-lg font-bold text-gray-900">Informations personnelles</h2>
                  <p className="mb-4 text-sm text-gray-600">Mettez à jour vos informations et préférences.</p>

                  <form className="space-y-4" onSubmit={handleProfileSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">Prénom</label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={event => setProfileForm(prev => ({ ...prev, firstName: event.target.value }))}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          placeholder="Votre prénom"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">Nom</label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={event => setProfileForm(prev => ({ ...prev, lastName: event.target.value }))}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          placeholder="Votre nom"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">Téléphone</label>
                        <input
                          type="tel"
                          value={profileForm.phoneNumber}
                          onChange={event => setProfileForm(prev => ({ ...prev, phoneNumber: event.target.value }))}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          placeholder="+236 70 00 00 00"
                        />
                        <p className="mt-2 text-xs text-gray-500">Validez dans la section Sécurité.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-800">Préférences notifications</h3>
                      {[
                        { key: 'newsletter' as const, label: 'Newsletter', description: 'Actualités & offres' },
                        { key: 'push' as const, label: 'Push', description: 'Statut commandes' },
                        { key: 'sms' as const, label: 'SMS', description: 'Alertes importantes' },
                        { key: 'whatsapp' as const, label: 'WhatsApp', description: 'Support client' },
                      ].map(pref => (
                        <label key={pref.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm hover:border-orange-300">
                          <div>
                            <p className="font-semibold text-gray-900">{pref.label}</p>
                            <p className="text-xs text-gray-500">{pref.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferencesForm[pref.key]}
                            onChange={event => setPreferencesForm(prev => ({ ...prev, [pref.key]: event.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                        </label>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-red-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-red-700"
                      disabled={profileSaving}
                    >
                      {profileSaving ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sauvegarde…
                        </span>
                      ) : (
                        'Enregistrer les modifications'
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                {/* Email */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-lg font-bold text-gray-900">Email & vérification</h2>
                  <p className="mb-4 text-sm text-gray-600">Mettez à jour votre email et vérifiez-le.</p>
                  
                  <form className="space-y-4" onSubmit={handleEmailUpdate}>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-800">Email actuel</label>
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{emailForm.value}</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-800">Nouvel email</label>
                      <input
                        type="email"
                        value={emailForm.newEmail}
                        onChange={event => setEmailForm(prev => ({ ...prev, newEmail: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        placeholder="nouveau@email.com"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                      disabled={emailSaving}
                    >
                      {emailSaving ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mise à jour…
                        </span>
                      ) : (
                        'Mettre à jour mon email'
                      )}
                    </Button>
                  </form>
                </div>

                {/* Téléphone */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-lg font-bold text-gray-900">Vérification téléphone</h2>
                  <p className="mb-4 text-sm text-gray-600">Sécurisez votre compte avec la validation SMS.</p>
                  
                  <form
                    className="space-y-4"
                    onSubmit={phoneForm.step === 'verify' ? handleVerifyOtp : event => { event.preventDefault(); handleSendOtp(); }}
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-800">Numéro de téléphone</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="tel"
                          value={phoneForm.phone}
                          onChange={event => setPhoneForm(prev => ({ ...prev, phone: event.target.value }))}
                          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          placeholder="+236 70 00 00 00"
                          disabled={phoneForm.step === 'verify'}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendOtp}
                          disabled={phoneSaving || phoneForm.step === 'verify'}
                          className="rounded-xl px-4 py-3"
                        >
                          {phoneSaving && phoneForm.step === 'idle' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Envoyer'
                          )}
                        </Button>
                      </div>
                    </div>

                    {phoneForm.step === 'verify' && (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-800">Code SMS</label>
                          <input
                            type="text"
                            value={phoneForm.code}
                            onChange={event => setPhoneForm(prev => ({ ...prev, code: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase tracking-widest focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            placeholder="123456"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-700"
                          disabled={phoneSaving}
                        >
                          {phoneSaving ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Vérification…
                            </span>
                          ) : (
                            'Confirmer le code'
                          )}
                        </Button>
                      </>
                    )}
                  </form>
                  <div id="phone-recaptcha" />
                </div>
              </div>
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
                <LogOut className="h-4 w-4" />
              )}
              {signingOut ? 'Déconnexion...' : 'Se déconnecter'}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto max-w-6xl px-4 py-12">
        {feedback && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-600'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="h-32 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600" />
            <CardContent className="relative px-4 pb-6 sm:px-8">
              <div className="relative -mt-16">
                <div className="flex flex-col gap-6 rounded-3xl bg-white px-6 py-6 shadow-xl sm:flex-row sm:items-center sm:gap-10 sm:px-10 sm:py-8">
                  <div className="relative mx-auto h-28 w-28 flex-shrink-0 sm:mx-0">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-gray-100 text-3xl font-bold text-orange-500 shadow-md">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName ?? 'Photo de profil'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-14 w-14 text-orange-500" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-2 right-2 rounded-full bg-white text-gray-700 shadow hover:bg-gray-100"
                      onClick={handlePhotoClick}
                      disabled={photoLoading}
                    >
                      {photoLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {user.firstName || user.lastName
                            ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                            : (user.displayName ?? 'Compte Pizza King')}
                        </h1>
                        <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span>{user.email}</span>
                          {emailVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle className="h-3 w-3" />
                              Email vérifié
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendVerificationEmail}
                              className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-200"
                            >
                              Vérifier l’email
                            </button>
                          )}
                        </p>
                        <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span>{formatPhone(user.phoneNumber)}</span>
                          {isPasswordProvider ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                              Vérification recommandée
                            </span>
                          ) : null}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="self-start rounded-full border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600"
                        onClick={() => setActiveTab('settings')}
                      >
                        Gérer mon profil
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="gap-1 rounded-full border border-orange-200 bg-orange-50 text-orange-600">
                        <Award className="h-3 w-3" />
                        {user.loyaltyPoints ?? 0} points •{' '}
                        {user.loyaltyTier?.toUpperCase?.() ?? 'BRONZE'}
                      </Badge>
                      {user.createdAt && (
                        <Badge variant="outline" className="gap-1 rounded-full">
                          <CalendarClock className="h-3 w-3" />
                          Membre depuis{' '}
                          {formatDate(
                            new Date(
                              user.createdAt?.toDate?.() ?? user.createdAt
                            )
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="h-full border-0 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.background}`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-60">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        activeTab === tab.id
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  ))}
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    {signingOut ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogOut className="h-5 w-5" />
                    )}
                    Déconnexion
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-0 shadow-md">
                  <CardContent className="space-y-4 p-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Activité récente
                      </h2>
                      <p className="text-sm text-gray-600">
                        Suivez vos commandes récentes et votre progression
                        fidélité.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                      Aucune commande récente. Commencez une nouvelle commande
                      pour alimenter votre historique.
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Préférences de notification
                        </h3>
                        <p className="text-sm text-gray-600">
                          Personnalisez les canaux par lesquels vous souhaitez
                          recevoir nos alertes.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        {
                          label: 'Email',
                          value: preferencesForm.newsletter,
                          description: 'Promotions, reçus et nouveautés.',
                        },
                        {
                          label: 'Push',
                          value: preferencesForm.push,
                          description: 'Suivi de commande en temps réel.',
                        },
                        {
                          label: 'SMS',
                          value: preferencesForm.sms,
                          description: 'Alertes de livraison urgentes.',
                        },
                        {
                          label: 'WhatsApp',
                          value: preferencesForm.whatsapp,
                          description:
                            'Support client et confirmations rapides.',
                        },
                      ].map(pref => (
                        <div
                          key={pref.label}
                          className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
                        >
                          <p className="flex items-center gap-2 font-semibold text-gray-900">
                            <Bell className="h-4 w-4 text-orange-500" />
                            {pref.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pref.description}
                          </p>
                          <p className="mt-2 text-xs font-semibold text-gray-600">
                            {pref.value
                              ? 'Activé'
                              : 'Désactivé (modifiable dans Paramètres)'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h2 className="mb-1 text-xl font-bold text-gray-900">
                      Informations personnelles
                    </h2>
                    <p className="mb-6 text-sm text-gray-600">
                      Mettez à jour vos informations de contact et vos
                      préférences.
                    </p>

                    <form className="space-y-6" onSubmit={handleProfileSubmit}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Prénom
                          </label>
                          <input
                            type="text"
                            value={profileForm.firstName}
                            onChange={event =>
                              setProfileForm(prev => ({
                                ...prev,
                                firstName: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            placeholder="Votre prénom"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nom
                          </label>
                          <input
                            type="text"
                            value={profileForm.lastName}
                            onChange={event =>
                              setProfileForm(prev => ({
                                ...prev,
                                lastName: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            placeholder="Votre nom"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Numéro de téléphone
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phoneNumber}
                          onChange={event =>
                            setProfileForm(prev => ({
                              ...prev,
                              phoneNumber: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          placeholder="+236 70 00 00 00"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Ajoutez votre numéro ici puis validez-le dans la
                          section Sécurité.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          {
                            key: 'newsletter' as const,
                            label: 'Newsletter',
                            description: 'Actualités & offres hebdomadaires',
                          },
                          {
                            key: 'push' as const,
                            label: 'Notifications push',
                            description: 'Statut des commandes en temps réel',
                          },
                          {
                            key: 'sms' as const,
                            label: 'SMS',
                            description: 'Alertes importantes & confirmation',
                          },
                          {
                            key: 'whatsapp' as const,
                            label: 'WhatsApp',
                            description:
                              'Support client et notifications rapides',
                          },
                        ].map(pref => (
                          <label
                            key={pref.key}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm hover:border-orange-300"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {pref.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {pref.description}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={preferencesForm[pref.key]}
                              onChange={event =>
                                setPreferencesForm(prev => ({
                                  ...prev,
                                  [pref.key]: event.target.checked,
                                }))
                              }
                              className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                          </label>
                        ))}
                      </div>

                      <Button
                        type="submit"
                        className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-red-700"
                        disabled={profileSaving}
                      >
                        {profileSaving ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sauvegarde…
                          </span>
                        ) : (
                          'Enregistrer les modifications'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-0 shadow-md">
                  <CardContent className="space-y-5 p-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Email & vérification
                      </h2>
                      <p className="text-sm text-gray-600">
                        Mettez à jour votre adresse email et assurez-vous
                        qu’elle est vérifiée.
                      </p>
                    </div>
                    <form className="space-y-4" onSubmit={handleEmailUpdate}>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Adresse email actuelle
                        </label>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{emailForm.value}</span>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Nouvelle adresse email
                        </label>
                        <input
                          type="email"
                          value={emailForm.newEmail}
                          onChange={event =>
                            setEmailForm(prev => ({
                              ...prev,
                              newEmail: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          placeholder="nouveau@email.com"
                          required
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Vous recevrez un email pour confirmer votre nouvelle
                          adresse.
                        </p>
                      </div>
                      <Button
                        type="submit"
                        className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                        disabled={emailSaving}
                      >
                        {emailSaving ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Mise à jour…
                          </span>
                        ) : (
                          'Mettre à jour mon email'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="space-y-5 p-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Vérification du téléphone
                      </h2>
                      <p className="text-sm text-gray-600">
                        Activez la validation par SMS pour sécuriser votre
                        compte.
                      </p>
                      {isPasswordProvider && !user.phoneNumber && (
                        <p className="mt-3 rounded-2xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
                          Ajoutez un numéro pour faciliter vos futures commandes
                          et récupérer votre compte en cas d’oubli de mot de
                          passe.
                        </p>
                      )}
                    </div>

                    <form
                      className="space-y-4"
                      onSubmit={
                        phoneForm.step === 'verify'
                          ? handleVerifyOtp
                          : event => {
                              event.preventDefault();
                              handleSendOtp();
                            }
                      }
                    >
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Numéro de téléphone
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="tel"
                            value={phoneForm.phone}
                            onChange={event =>
                              setPhoneForm(prev => ({
                                ...prev,
                                phone: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            placeholder="+236 70 00 00 00"
                            disabled={phoneForm.step === 'verify'}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendOtp}
                            disabled={
                              phoneSaving || phoneForm.step === 'verify'
                            }
                          >
                            {phoneSaving && phoneForm.step === 'idle' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Envoyer le code'
                            )}
                          </Button>
                        </div>
                      </div>

                      {phoneForm.step === 'verify' && (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Code SMS
                          </label>
                          <input
                            type="text"
                            value={phoneForm.code}
                            onChange={event =>
                              setPhoneForm(prev => ({
                                ...prev,
                                code: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm uppercase tracking-widest focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            placeholder="123456"
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            Entrez le code reçu par SMS pour confirmer votre
                            numéro.
                          </p>
                        </div>
                      )}

                      {phoneForm.step === 'verify' && (
                        <Button
                          type="submit"
                          className="rounded-xl bg-orange-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-orange-700"
                          disabled={phoneSaving}
                        >
                          {phoneSaving ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Vérification…
                            </span>
                          ) : (
                            'Confirmer le code'
                          )}
                        </Button>
                      )}
                    </form>
                    <div id="phone-recaptcha" />
                  </CardContent>
                </Card>
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
