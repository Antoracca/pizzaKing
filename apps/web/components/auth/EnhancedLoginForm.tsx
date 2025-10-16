'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Eye, EyeOff, Loader2, Mail, Lock, Phone as PhoneIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@pizza-king/shared';
import {
  validateEmail,
  validatePhone,
  checkEmailExists,
  checkPhoneExists,
  checkIsGoogleUser,
  getEmailByPhone,
  getUserByPhone,
} from '@/lib/auth/validation';

type FieldStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'warning' | 'info';

type EnhancedLoginFormProps = { backHref?: string };

export default function EnhancedLoginForm({ backHref = '/' }: EnhancedLoginFormProps) {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Field-level messaging
  const [emailStatus, setEmailStatus] = useState<FieldStatus>('idle');
  const [emailHint, setEmailHint] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<FieldStatus>('idle');
  const [phoneHint, setPhoneHint] = useState('');
  const [passwordHint, setPasswordHint] = useState('');

  // Other UI state
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const router = useRouter();
  const { signIn, signInWithGoogle, resendEmailVerification } = useAuth();

  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const r = sp.get('redirect');
      if (r) setRedirectTo(r);
    } catch {
      // ignore
    }
  }, []);

  // We handle redirects explicitly after successful sign-in

  // Debounced real-time checks
  const emailDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear opposite-field errors when switching mode
  useEffect(() => {
    if (mode === 'email') {
      setPhoneStatus('idle');
      setPhoneHint('');
      setPasswordHint('');
    } else {
      setEmailStatus('idle');
      setEmailHint('');
      setPendingVerification(false);
      setPasswordHint('');
    }
  }, [mode]);

  // Clear opposite-field errors when switching mode
  useEffect(() => {
    if (mode === 'email') {
      // Hide/clear phone-side messages when on email mode
      setPhoneStatus('idle');
      setPhoneHint('');
    } else {
      // Hide/clear email-side messages when on phone mode
      setEmailStatus('idle');
      setEmailHint('');
      setPendingVerification(false);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'email') return;
    if (emailDebounce.current) clearTimeout(emailDebounce.current);

    const { valid, message } = validateEmail(email.trim());
    if (!email) {
      setEmailStatus('idle');
      setEmailHint('');
      return;
    }

    if (!valid) {
      setEmailStatus('invalid');
      setEmailHint(message);
      return;
    }

    setEmailStatus('checking');
    setEmailHint('Vérification de votre adresse…');

    emailDebounce.current = setTimeout(async () => {
      try {
        const [exists, isGoogle] = await Promise.all([
          checkEmailExists(email.trim()),
          checkIsGoogleUser(email.trim()),
        ]);

        if (!exists) {
          setEmailStatus('invalid');
          setEmailHint("Aucun compte trouvé avec cette adresse e‑mail.");
        } else if (isGoogle) {
          setEmailStatus('warning');
          setEmailHint(
            'Ce compte a été créé avec Google. Utilisez la connexion Google ci‑dessous.'
          );
        } else {
          setEmailStatus('valid');
          setEmailHint('Compte trouvé. Vous pouvez saisir votre mot de passe.');
        }
      } catch (error: unknown) {
        const msg = (error as { message?: string } | null)?.message;
        setEmailStatus('invalid');
        setEmailHint(msg || "Impossible de vérifier l'adresse e‑mail pour le moment.");
      }
    }, 400);

    return () => {
      if (emailDebounce.current) clearTimeout(emailDebounce.current);
    };
  }, [email, mode]);

  useEffect(() => {
    if (mode !== 'phone') return;
    if (phoneDebounce.current) clearTimeout(phoneDebounce.current);

    const { valid, message } = validatePhone(phone || '');
    if (!phone) {
      setPhoneStatus('idle');
      setPhoneHint('');
      return;
    }

    if (!valid) {
      setPhoneStatus('invalid');
      setPhoneHint(message);
      return;
    }

    setPhoneStatus('checking');
    setPhoneHint('Vérification du numéro…');

    phoneDebounce.current = setTimeout(async () => {
      try {
        const userDoc = await getUserByPhone((phone || '').trim());
        if (!userDoc) {
          setPhoneStatus('invalid');
          setPhoneHint('Aucun compte trouvé avec ce numéro.');
        } else {
          const verified = Boolean((userDoc as { phoneVerified?: boolean } | null)?.phoneVerified);
          if (!verified) {
            setPhoneStatus('warning');
            setPhoneHint(
              "Ce numéro n'est pas encore vérifié. Vous pourrez le vérifier après connexion."
            );
          } else {
            setPhoneStatus('valid');
            setPhoneHint('Compte trouvé. Vous pouvez saisir votre mot de passe.');
          }
        }
      } catch (error: unknown) {
        const msg = (error as { message?: string } | null)?.message;
        setPhoneStatus('invalid');
        setPhoneHint(msg || 'Impossible de vérifier le numéro pour le moment.');
      }
    }, 400);

    return () => {
      if (phoneDebounce.current) clearTimeout(phoneDebounce.current);
    };
  }, [phone, mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPasswordHint('');
    setPendingVerification(false);

    // Basic validation
    let resolvedEmail: string | null = null;
    if (mode === 'email') {
      const v = validateEmail(email.trim());
      if (!v.valid) {
        setEmailStatus('invalid');
        setEmailHint(v.message);
        return;
      }
      resolvedEmail = email.trim();
    } else {
      const v = validatePhone(phone || '');
      if (!v.valid) {
        setPhoneStatus('invalid');
        setPhoneHint(v.message);
        return;
      }
    }

    if (!password) {
      setPasswordHint('Merci de saisir votre mot de passe.');
      return;
    }

    setChecking(true);
    let phoneVerifiedOk = false;
    try {
      if (mode === 'email') {
        const exists = await checkEmailExists(email.trim());
        if (!exists) {
          setEmailStatus('invalid');
          setEmailHint("Aucun compte trouvé avec cette adresse e‑mail.");
          setChecking(false);
          return;
        }

        const isGoogle = await checkIsGoogleUser(email.trim());
        if (isGoogle) {
          setEmailStatus('warning');
          setEmailHint(
            'Ce compte a été créé avec Google. Utilisez la connexion Google ci‑dessous.'
          );
          setChecking(false);
          return;
        }
        resolvedEmail = email.trim();
      } else {
        const trimmedPhone = (phone || '').trim();
        const exists = await checkPhoneExists(trimmedPhone);
        if (!exists) {
          setPhoneStatus('invalid');
          setPhoneHint('Aucun compte trouvé avec ce numéro.');
          setChecking(false);
          return;
        }
        // Ensure the phone itself is verified before proceeding
        try {
          const phoneUserDoc = await getUserByPhone(trimmedPhone);
          const phoneIsVerified = Boolean((phoneUserDoc as any)?.phoneVerified);
          if (!phoneIsVerified) {
            setPhoneStatus('invalid');
            setPhoneHint('Numéro de téléphone non vérifié. Connectez‑vous avec votre email.');
            setChecking(false);
            return;
          }
          phoneVerifiedOk = true;
        } catch (_e) {
          void 0; // noop
        }

        const mapped = await getEmailByPhone(trimmedPhone);
        if (!mapped) {
          setPhoneStatus('invalid');
          setPhoneHint(
            'Impossible de trouver un e‑mail associé à ce numéro. Contactez le support.'
          );
          setChecking(false);
          return;
        }
        resolvedEmail = mapped;
      }
      } catch (validationError: unknown) {
        // Surface the validation failure under the appropriate field
        if (mode === 'email') {
          setEmailStatus('invalid');
          setEmailHint(
            (validationError as { message?: string } | null)?.message ||
              'Impossible de vérifier votre compte. Réessayez.'
          );
        } else {
          setPhoneStatus('invalid');
          setPhoneHint(
            (validationError as { message?: string } | null)?.message ||
              'Impossible de vérifier votre compte. Réessayez.'
          );
        }
        setChecking(false);
        return;
      }

    setChecking(false);
    setLoading(true);

    try {
      if (mode === 'phone') {
        await signIn((resolvedEmail as string).trim(), password, {
          allowUnverifiedEmail: phoneVerifiedOk,
        });
        try {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('pk_phone_login_success', '1');
          }
        } catch { /* empty */ }
          router.replace(redirectTo || '/');
      } else {
        await signIn((resolvedEmail as string).trim(), password);
        try {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('pk_email_login_success', '1');
          }
        } catch { /* empty */ }
          router.replace(redirectTo || '/');
      }
      } catch (signInError: unknown) {
        // stay on the page and surface a clear message

        // Map Firebase errors to field-level messages
        const code = (signInError as { code?: string } | null)?.code || '';
        if (code === 'auth/email-not-verified') {
          setPendingVerification(true);
          setEmailStatus('invalid');
          setEmailHint(
            "Votre email n'est pas encore vérifié. Ouvrez le lien reçu par email pour activer votre compte, puis revenez vous connecter. Vous pouvez renvoyer le mail ci‑dessous."
          );
          // If user was logging in via phone, surface the message under the email field
          if (mode === 'phone' && resolvedEmail) {
            setEmail(resolvedEmail);
            setMode('email');
          }
          setLoading(false);
          return;
        }

      switch (code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setPasswordHint('Mot de passe incorrect. Réessayez.');
          break;
        case 'auth/user-not-found':
          if (mode === 'email') {
            setEmailStatus('invalid');
            setEmailHint("Aucun compte trouvé avec cette adresse e‑mail.");
          } else {
            setPhoneStatus('invalid');
            setPhoneHint('Aucun compte trouvé avec ce numéro.');
          }
          break;
        case 'auth/too-many-requests':
          setPasswordHint("Trop de tentatives. Connexion temporairement bloquée. Réessayez plus tard ou réinitialisez votre mot de passe.");
          break;
        case 'auth/network-request-failed':
          setPasswordHint('Problème réseau. Vérifiez votre connexion.');
          break;
        default:
          setPasswordHint('Connexion impossible. Réessayez.');
      }
      } finally {
        setLoading(false);
      }
    };

    const handleResendEmail = async (): Promise<void> => {
      if (!email) return;
      setResendLoading(true);
      setPasswordHint('');

      try {
        await resendEmailVerification(email.trim(), password);
        setEmailStatus('info');
        setEmailHint(
          "Un nouvel email de vérification vient d'être envoyé. Vérifiez votre boîte mail."
        );
    } catch (resendError: unknown) {
      const code = (resendError as { code?: string } | null)?.code || '';
      const raw = (resendError as { message?: string } | null)?.message || '';
      const msg = raw.toLowerCase();
      if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
        setEmailStatus('warning');
        setEmailHint(
          'Trop de demandes de vérification. Patientez quelques minutes puis réessayez.'
        );
      } else if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        setEmailStatus('invalid');
        setEmailHint('Problème réseau. Réessayez plus tard.');
      } else {
        setEmailStatus('invalid');
        setEmailHint("Impossible d'envoyer l'email de vérification. Réessayez plus tard.");
      }
    } finally {
      setResendLoading(false);
    }
  };

    const handleGoogleLogin = async (): Promise<void> => {
      setLoading(true);
      setPasswordHint('');
      try {
        await signInWithGoogle();
      } catch (googleError: unknown) {
        const code = (googleError as { code?: string } | null)?.code || '';
        let message = 'Connexion Google impossible. Réessayez.';
        switch (code) {
          case 'auth/popup-closed-by-user':
            message = 'Fenêtre fermée avant la validation.';
            break;
          case 'auth/network-request-failed':
            message = 'Problème réseau. Vérifiez votre connexion.';
            break;
          default:
            {
              const m = (googleError as { message?: string } | null)?.message;
              if (m) message = m;
            }
        }
        setPasswordHint(message);
      } finally {
        setLoading(false);
      }
    };

  const EmailStatusIcon = useMemo(() => {
    if (emailStatus === 'valid') return <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />;
    if (emailStatus === 'invalid') return <XCircle className="h-4 w-4 text-red-500" aria-hidden />;
    if (emailStatus === 'warning') return <XCircle className="h-4 w-4 text-amber-500" aria-hidden />;
    return null;
  }, [emailStatus]);

  const PhoneStatusIcon = useMemo(() => {
    if (phoneStatus === 'valid') return <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />;
    if (phoneStatus === 'invalid') return <XCircle className="h-4 w-4 text-red-500" aria-hidden />;
    if (phoneStatus === 'warning') return <XCircle className="h-4 w-4 text-amber-500" aria-hidden />;
    return null;
  }, [phoneStatus]);

  return (
    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <Link
        href={backHref}
        className="absolute left-4 top-4 z-10 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
        aria-label="Retour"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="mb-6 flex flex-col gap-2 text-center sm:mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Bienvenue</h1>
        <p className="text-sm text-gray-600 sm:text-base">
          Connectez-vous pour retrouver vos commandes et vos offres.
        </p>
      </div>

      {/* Mode switcher */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setMode('email')}
          className={`${
            mode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600'
          } flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition`}
          aria-pressed={mode === 'email'}
        >
          <Mail className="h-4 w-4" /> Email
        </button>
        <button
          type="button"
          onClick={() => setMode('phone')}
          className={`${
            mode === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600'
          } flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition`}
          aria-pressed={mode === 'phone'}
        >
          <PhoneIcon className="h-4 w-4" /> Téléphone
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {mode === 'email' ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="email"
                aria-invalid={emailStatus === 'invalid'}
                aria-describedby="email-help"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pl-11 pr-12 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="vous@example.com"
                required
              />
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {emailStatus === 'checking' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden />
                ) : (
                  EmailStatusIcon
                )}
              </div>
            </div>
            {emailHint && (
              <p
                id="email-help"
                className={`text-xs ${
                  emailStatus === 'invalid'
                    ? 'text-red-600'
                    : emailStatus === 'warning'
                      ? 'text-amber-600'
                      : emailStatus === 'valid'
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                }`}
              >
                {emailHint}
              </p>
            )}

              {pendingVerification && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="text-xs font-medium text-orange-600 hover:text-orange-500 disabled:opacity-60"
                  >
                    {resendLoading ? 'Renvoi en cours…' : 'Renvoyer le mail de vérification'}
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Téléphone</label>
            <div className="relative">
                <PhoneInput
                  className="PhoneInput"
                  international
                  defaultCountry="FR"
                  value={phone || undefined}
                  onChange={value => setPhone(value ?? '')}
                numberInputProps={{
                  required: true,
                  'aria-invalid': phoneStatus === 'invalid',
                  'aria-describedby': 'phone-help',
                    className:
                        'w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20',
                }}
                  countrySelectProps={{
                    className:
                      'rounded-lg border border-gray-300 bg-white px-2 py-2 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20',
                  }}
                />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {phoneStatus === 'checking' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden />
                ) : (
                  PhoneStatusIcon
                )}
              </div>
            </div>
            {phoneHint && (
              <p
                id="phone-help"
                className={`text-xs ${
                  phoneStatus === 'invalid'
                    ? 'text-red-600'
                    : phoneStatus === 'valid'
                      ? 'text-emerald-600'
                      : phoneStatus === 'warning'
                        ? 'text-amber-600'
                        : 'text-gray-500'
                }`}
              >
                {phoneHint}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(passwordHint)}
              aria-describedby="password-help"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pl-11 pr-11 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="••••••••"
                required
              />
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordHint && (
            <p id="password-help" className="text-xs text-red-600">{passwordHint}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
            <span>Se souvenir de moi</span>
          </label>
          <a className="font-medium text-orange-600 hover:text-orange-500" href="/auth/reset-password">
            Mot de passe oublié ?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading || checking}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(loading || checking) && <Loader2 className="h-4 w-4 animate-spin" />}
          {checking ? 'Vérification…' : loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        <span>Ou</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuer avec Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <a href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-500">
          Inscrivez-vous
        </a>
      </p>
    </div>
  );
}
