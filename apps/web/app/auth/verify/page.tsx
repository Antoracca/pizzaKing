'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  sendEmailVerification,
  reload,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  updatePhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, MailCheck, MailQuestion, Smartphone, X, ArrowLeft } from 'lucide-react';
import { useAuth, type UserStatus, type User } from '@pizza-king/shared/src/hooks/useAuth';
import { db, auth } from '@/lib/firebase';
import { useDetectedCountry } from '@/lib/utils/countryDetection';

const MAX_SMS_ATTEMPTS = 10;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const ATTEMPT_STORAGE_KEY = 'pk_phone_attempts';

type PhoneAttemptStatus = {
  allowed: boolean;
  waitMs: number;
  attempts: number[];
  all: Record<string, number[]>;
};

const readPhoneAttempts = (): Record<string, number[]> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ATTEMPT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number[]>;
    return parsed ?? {};
  } catch (error) {
    console.error('Failed to read phone attempts from storage:', error);
    return {};
  }
};

const writePhoneAttempts = (data: Record<string, number[]>): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to persist phone attempts:', error);
  }
};

const pruneAttempts = (attempts: number[], now: number): number[] =>
  attempts.filter(timestamp => now - timestamp < BLOCK_DURATION_MS);

const getPhoneAttemptStatus = (phone: string): PhoneAttemptStatus => {
  const all = readPhoneAttempts();
  const now = Date.now();
  const currentAttempts = pruneAttempts(all[phone] ?? [], now);

  if (currentAttempts.length >= MAX_SMS_ATTEMPTS) {
    const waitMs = BLOCK_DURATION_MS - (now - currentAttempts[0]);
    return { allowed: false, waitMs, attempts: currentAttempts, all };
  }

  all[phone] = currentAttempts;
  return { allowed: true, waitMs: 0, attempts: currentAttempts, all };
};

const registerPhoneAttempt = (
  phone: string,
  data: PhoneAttemptStatus
): void => {
  const now = Date.now();
  const all = data.all;
  const updated = pruneAttempts(all[phone] ?? [], now);
  updated.push(now);
  all[phone] = updated;
  writePhoneAttempts(all);
};

const formatWaitTime = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

type Alert = {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
} | null;

const alertStyles: Record<NonNullable<Alert>['type'], string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
};

export default function VerifyPage() {
  const router = useRouter();
  const { firebaseUser, loading, updateUserProfile, user } = useAuth();
  const { country, detectedCountry, isDetecting } = useDetectedCountry();

  const [alert, setAlert] = useState<Alert>(null);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneStep, setPhoneStep] = useState<'idle' | 'code'>('idle');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  
  // Force le re-render du PhoneInput quand le pays est détecté
  const [phoneInputKey, setPhoneInputKey] = useState(0);

  useEffect(() => {
    if (detectedCountry && !isDetecting) {
      setPhoneInputKey(prev => prev + 1); // Force re-render
    }
  }, [detectedCountry, isDetecting]);

  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const confirmationResult = useRef<ConfirmationResult | null>(null);
  const initialPhoneRef = useRef<string>('');

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace('/auth/login');
      return;
    }

    if (!loading && firebaseUser?.emailVerified) {
      handleVerified({ via: 'email' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.emailVerified, loading]);

  useEffect(() => {
    if (!phoneModalOpen) return;

    // Récupérer le téléphone depuis le sessionStorage si disponible (post-inscription)
    let derivedPhone = user?.phoneNumber || firebaseUser?.phoneNumber || '';

    try {
      if (typeof window !== 'undefined') {
        const signupPhone = window.sessionStorage.getItem('pk_signup_phone');
        if (signupPhone && !derivedPhone) {
          derivedPhone = signupPhone;
        }
      }
    } catch { /* empty */ }

    initialPhoneRef.current = derivedPhone;
    setPhoneValue(derivedPhone);
    setPhoneCode('');
    setPhoneStep('idle');
    setIsEditingPhone(false); // Par défaut, pas en mode édition
  }, [phoneModalOpen, user?.phoneNumber, firebaseUser?.phoneNumber]);

  useEffect(() => {
    if (phoneModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [phoneModalOpen]);

  const handleVerified = async (
    options: { via: 'email' | 'phone'; phoneNumber?: string } = { via: 'email' }
  ) => {
    try {
      if (!firebaseUser) return;

      const profileUpdates: Partial<User> & { status: UserStatus } = {
        status: 'active',
      };

      if (options.via === 'email') {
        profileUpdates.emailVerified = true;
      }

      if (options.via === 'phone') {
        profileUpdates.phoneVerified = true;
        if (options.phoneNumber) {
          profileUpdates.phoneNumber = options.phoneNumber;
        }
      }

      if (user) {
        await updateUserProfile(profileUpdates);
      } else {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, {
          ...profileUpdates,
          updatedAt: serverTimestamp(),
        });
      }

      setAlert({
        type: 'success',
        message:
          options.via === 'email'
            ? 'Votre email est vérifié. Redirection…'
            : 'Votre numéro est vérifié. Redirection…',
      });

      // Marquer que l'utilisateur vient de terminer la vérification
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('pk_verification_success', '1');
        }
      } catch { /* empty */ }
      
      router.replace('/auth/verify/success');
    } catch (error: any) {
      console.error('Failed to update user profile after verification:', error);
      setAlert({
        type: 'error',
        message:
          options.via === 'email'
            ? 'Email vérifié mais la mise à jour du profil a échoué. Contactez le support.'
            : 'SMS vérifié mais la mise à jour du profil a échoué. Contactez le support.',
      });
    }
  };

  const handleResendEmail = async () => {
    if (!firebaseUser) return;
    setResending(true);
    setAlert(null);

    try {
      await sendEmailVerification(firebaseUser);
      setAlert({
        type: 'success',
        message: 'Email de vérification renvoyé. Vérifiez votre boîte mail.',
      });
    } catch (error: any) {
      setAlert({
        type: 'error',
        message:
          error?.message ||
          "Impossible d'envoyer l'email. Réessayez plus tard.",
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!firebaseUser) return;
    setChecking(true);
    setAlert({
      type: 'info',
      message: 'Nous vérifions votre statut de vérification…',
    });

    try {
      await reload(firebaseUser);

      if (firebaseUser.emailVerified) {
        await handleVerified({ via: 'email' });
        return;
      }

      setAlert({
        type: 'warning',
        message:
          "Votre email n'est pas encore confirmé. Cliquez sur le lien reçu ou renvoyez un email.",
      });
    } catch (error: any) {
      console.error('Verification check failed:', error);
      setAlert({
        type: 'error',
        message:
          error?.message || 'Impossible de vérifier votre email. Réessayez.',
      });
    } finally {
      setChecking(false);
    }
  };

  const resetPhoneFlow = () => {
    setPhoneStep('idle');
    setPhoneCode('');
    setPhoneLoading(false);
    setPhoneError('');
    setCooldownTime(0);
    setIsEditingPhone(false);
    confirmationResult.current = null;
    if (recaptchaVerifier.current) {
      recaptchaVerifier.current.clear();
      recaptchaVerifier.current = null;
    }
  };

  // Effet pour gérer le cooldown
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const closePhoneModal = () => {
    setPhoneModalOpen(false);
    resetPhoneFlow();
  };

  const getRecaptcha = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const container = document.getElementById('phone-verification-recaptcha');
    if (!container) {
      console.warn('Recaptcha container not found in DOM.');
      return null;
    }

    if (!recaptchaVerifier.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(
        auth,
        'phone-verification-recaptcha',
        {
          size: 'invisible',
        }
      );
    }

    return recaptchaVerifier.current;
  };

  const formatPhoneError = (error: any): string => {
    const code = error?.code ?? '';
    const suffix = code ? ` (code: ${code})` : '';

    switch (code) {
      case 'auth/invalid-phone-number':
        return 'Numéro de téléphone invalide.' + suffix;
      case 'auth/missing-phone-number':
        return 'Merci de renseigner un numéro.' + suffix;
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard.' + suffix;
      case 'auth/operation-not-allowed':
        return (
          'La connexion par SMS n’est pas activée sur Firebase. Vérifiez la console Firebase.' +
          suffix
        );
      case 'auth/invalid-verification-code':
        return 'Code invalide. Vérifiez et réessayez.' + suffix;
      case 'auth/missing-verification-code':
        return 'Merci de saisir le code reçu.' + suffix;
      default:
        return (
          (error?.message || 'Une erreur est survenue. Réessayez.') + suffix
        );
    }
  };

  const handleSendPhoneCode = async () => {
    if (!phoneValue) {
      setPhoneError('Merci de saisir un numéro de téléphone valide.');
      return;
    }

    const verifier = getRecaptcha();
    if (!verifier) {
      setPhoneError('Vérification indisponible. Réessayez.');
      return;
    }

    setPhoneLoading(true);
    setPhoneError('');

    try {
      try {
        await verifier.render();
      } catch (renderError) {
        console.error('Recaptcha render error:', renderError);
      }

      await verifier.verify();
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneValue,
        verifier
      );
      confirmationResult.current = confirmation;
      setPhoneStep('code');
      setCooldownTime(24); // Délai de 24 secondes
    } catch (error: any) {
      console.error('Phone verification send failed:', error);
      setPhoneError(formatPhoneError(error));
      setPhoneStep('idle');
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = null;
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleConfirmPhoneCode = async () => {
    if (!firebaseUser || !confirmationResult.current) {
      setPhoneError('Vérification indisponible. Réessayez.');
      return;
    }

    if (!phoneCode.trim()) {
      setPhoneError('Merci de saisir le code reçu.');
      return;
    }

    setPhoneLoading(true);
    setPhoneError('');

    try {
      const credential = PhoneAuthProvider.credential(
        confirmationResult.current.verificationId,
        phoneCode.trim()
      );

      await updatePhoneNumber(firebaseUser, credential);

      await handleVerified({ via: 'phone', phoneNumber: phoneValue });
      closePhoneModal();
    } catch (error: any) {
      console.error('Phone verification confirm failed:', error);
      setPhoneError(formatPhoneError(error));
    } finally {
      setPhoneLoading(false);
    }
  };

  const showPhoneOption = !user?.phoneVerified;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-10 sm:py-12">
      <div className="w-full max-w-xl space-y-6 rounded-3xl bg-white p-6 shadow-xl sm:space-y-8 sm:p-8 lg:max-w-2xl lg:p-10">
        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
            <MailQuestion
              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              aria-hidden
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl lg:text-4xl">
            Vérifiez votre adresse email
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Un email de confirmation a été envoyé à {firebaseUser?.email}.
            Cliquez sur le lien pour activer votre compte.
          </p>
        </div>

        {alert && (
          <div
            className={`rounded-xl border p-4 text-sm font-medium ${alertStyles[alert.type]}`}
            role="alert"
          >
            {alert.message}
          </div>
        )}

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:space-y-5 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600 sm:h-10 sm:w-10">
              <MailCheck className="h-5 w-5" aria-hidden />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800 sm:text-base">
                Pas reçu de mail ?
              </p>
              <p className="text-xs text-gray-600 sm:text-sm">
                Vérifiez vos spams ou renvoyez un email.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 sm:py-2.5 sm:text-base"
          >
            {resending ? 'Envoi en cours…' : 'Renvoyer l’email de vérification'}
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
          <div className="mb-3 text-left">
            <p className="text-sm font-semibold text-gray-800 sm:text-base">
              J’ai cliqué sur le lien
            </p>
            <p className="text-xs text-gray-600 sm:text-sm">
              Cliquez ci-dessous pour confirmer que votre email est vérifié.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckVerification}
            disabled={checking}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:py-2.5 sm:text-base"
          >
            {checking && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            {checking ? 'Vérification…' : 'J’ai confirmé mon email'}
          </button>
        </div>

        {showPhoneOption && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-600 sm:h-10 sm:w-10">
                <Smartphone className="h-5 w-5" aria-hidden />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800 sm:text-base">
                  Préférez la vérification par SMS ?
                </p>
                <p className="text-xs text-gray-600 sm:text-sm">
                  Recevez un code à usage unique sur votre numéro de téléphone.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPhoneModalOpen(true)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 sm:py-2.5 sm:text-base"
            >
              Vérifier via le numéro de téléphone
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-500 sm:text-sm">
          Si vous rencontrez toujours des difficultés, contactez le support
          Pizza King.
        </p>
      </div>

      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 sm:py-10">
          <div className="relative flex w-full max-w-lg flex-col rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-4 flex items-center gap-3 sm:mb-6">
              <button
                type="button"
                onClick={closePhoneModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                  Vérification par SMS
                </h2>
                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                  Confirmez votre numéro pour activer votre compte sans email.
                </p>
              </div>
              <div className="h-10 w-10" aria-hidden></div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {!isEditingPhone ? (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Numéro de téléphone
                  </label>
                  <div className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-5 py-3.5 text-base text-gray-800 font-medium">
                    {phoneValue || 'Aucun numéro disponible'}
                  </div>
                  <p className="text-xs text-gray-500">
                    Code OTP envoyé à ce numéro
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Modifier le numéro de téléphone
                  </label>
                  <PhoneInput
                    key={phoneInputKey}
                    international
                    defaultCountry={country}
                    value={phoneValue || undefined}
                    onChange={value => setPhoneValue(value ?? '')}
                    className="PhoneInput"
                    numberInputProps={{
                      required: true,
                      'aria-invalid': false,
                      'aria-describedby': 'verify-phone-help',
                      className: 'w-full rounded-2xl border border-gray-300 px-5 py-3.5 text-base focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200',
                    }}
                    countrySelectProps={{
                      className: 'rounded-2xl border border-gray-300 bg-white px-3 py-3.5 text-base focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200',
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Modifiez le numéro puis envoyez le code
                  </p>
                </div>
              )}

              {phoneStep === 'code' && (
                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Code SMS
                  </label>
                  <input
                    value={phoneCode}
                    onChange={event => setPhoneCode(event.target.value)}
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-lg tracking-widest focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="123456"
                  />
                  <p className="text-xs text-gray-500">
                    Entrez le code reçu par SMS.
                  </p>
                </div>
              )}

              {phoneError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {phoneError}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {phoneStep === 'code' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleConfirmPhoneCode}
                      disabled={phoneLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:py-2.5 sm:text-base"
                    >
                      {phoneLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      )}
                      {phoneLoading ? 'Vérification…' : 'Confirmer le code'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendPhoneCode}
                      disabled={phoneLoading || cooldownTime > 0}
                      className={`text-sm font-medium transition ${
                        cooldownTime > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-orange-600 hover:text-orange-500'
                      }`}
                    >
                      {cooldownTime > 0
                        ? `Renvoyer le code (${cooldownTime}s)`
                        : 'Renvoyer le code'
                      }
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSendPhoneCode}
                      disabled={phoneLoading || !phoneValue}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:py-2.5 sm:text-base"
                    >
                      {phoneLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      )}
                      {phoneLoading ? 'Envoi du code…' : 'Envoyer le code'}
                    </button>
                    {!isEditingPhone && phoneValue && (
                      <button
                        type="button"
                        onClick={() => setIsEditingPhone(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 sm:py-2.5 sm:text-base"
                      >
                        Modifier le numéro
                      </button>
                    )}
                  </>
                )}
              </div>

              <div
                id="phone-verification-recaptcha"
                className="absolute left-0 top-0 h-0 w-0 overflow-hidden"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
