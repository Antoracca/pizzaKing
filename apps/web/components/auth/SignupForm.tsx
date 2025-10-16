'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@pizza-king/shared';
import {
  validateEmail,
  validatePassword,
  checkEmailExists,
  checkPhoneExists,
  validatePhone,
} from '@/lib/auth/validation';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const INITIAL_STATE: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function SignupForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'warning'>('idle');
  const [emailHint, setEmailHint] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [phoneHint, setPhoneHint] = useState('');
  const [confirmHint, setConfirmHint] = useState('');
  const [firstNameHint, setFirstNameHint] = useState('');
  const [lastNameHint, setLastNameHint] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [passwordHint, setPasswordHint] = useState('');

  const router = useRouter();
  const { signUp } = useAuth();

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Field-level validation for names
    if (field === 'firstName') {
      const v = value.trim();
      if (!v) setFirstNameHint('Le prénom est requis.');
      else if (v.length < 2) setFirstNameHint('Le prénom doit contenir au moins 2 caractères.');
      else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(v)) setFirstNameHint('Utilisez uniquement des lettres (é, è, - et apostrophe autorisés).');
      else setFirstNameHint('');
    }
    if (field === 'lastName') {
      const v = value.trim();
      if (!v) setLastNameHint('Le nom est requis.');
      else if (v.length < 2) setLastNameHint('Le nom doit contenir au moins 2 caractères.');
      else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(v)) setLastNameHint('Utilisez uniquement des lettres (é, è, - et apostrophe autorisés).');
      else setLastNameHint('');
    }
  };

  // Debounced real-time validation for email & phone
  const emailDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (emailDebounce.current) clearTimeout(emailDebounce.current);
    const trimmed = form.email.trim();
    if (!trimmed) {
      if (hasSubmitted) {
        setEmailStatus('invalid');
        setEmailHint("L'email est requis");
      } else {
        setEmailStatus('idle');
        setEmailHint('');
      }
      return;
    }
    const v = validateEmail(trimmed);
    if (!v.valid) {
      setEmailStatus('invalid');
      setEmailHint(v.message);
      return;
    }
    setEmailStatus('checking');
    setEmailHint('Vérification de la disponibilité…');
    emailDebounce.current = setTimeout(async () => {
      try {
        const exists = await checkEmailExists(trimmed);
        if (exists) {
          setEmailStatus('invalid');
          setEmailHint('Cet email est déjà utilisé.');
        } else {
          setEmailStatus('valid');
          setEmailHint('Email disponible.');
        }
      } catch (e: any) {
        setEmailStatus('invalid');
        setEmailHint(e?.message || 'Impossible de vérifier cet email.');
      }
    }, 400);
    return () => {
      if (emailDebounce.current) clearTimeout(emailDebounce.current);
    };
  }, [form.email, hasSubmitted]);

  useEffect(() => {
    if (phoneDebounce.current) clearTimeout(phoneDebounce.current);
    const value = form.phone || '';
    if (!value) {
      if (hasSubmitted) {
        setPhoneStatus('invalid');
        setPhoneHint('Le numéro de téléphone est requis');
      } else {
        setPhoneStatus('idle');
        setPhoneHint('');
      }
      return;
    }
    const v = validatePhone(value);
    if (!v.valid) {
      setPhoneStatus('invalid');
      setPhoneHint(v.message);
      return;
    }
    setPhoneStatus('checking');
    setPhoneHint('Vérification de la disponibilité…');
    phoneDebounce.current = setTimeout(async () => {
      try {
        const exists = await checkPhoneExists(value.trim());
        if (exists) {
          setPhoneStatus('invalid');
          setPhoneHint('Ce numéro est déjà utilisé.');
        } else {
          setPhoneStatus('valid');
          setPhoneHint('Numéro disponible.');
        }
      } catch (e: any) {
        setPhoneStatus('invalid');
        setPhoneHint(e?.message || 'Impossible de vérifier ce numéro.');
      }
    }, 400);
    return () => {
      if (phoneDebounce.current) clearTimeout(phoneDebounce.current);
    };
  }, [form.phone, hasSubmitted]);

  // Password strength (live)
  const passChecks = useMemo(() => {
    const pwd = form.password || '';
    return {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      digit: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  }, [form.password]);
  const passAll = passChecks.length && passChecks.upper && passChecks.lower && passChecks.digit && passChecks.special;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setConfirmHint('');
      setHasSubmitted(true);
      setPasswordHint('');

      // Validate all fields and show all errors at once
      let ok = true;

      const first = form.firstName.trim();
      const last = form.lastName.trim();
      if (!first) {
        setFirstNameHint('Le prénom est requis.');
        ok = false;
      } else if (first.length < 2) {
        setFirstNameHint('Le prénom doit contenir au moins 2 caractères.');
        ok = false;
      } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(first)) {
        setFirstNameHint('Utilisez uniquement des lettres (é, è, - et apostrophe autorisés).');
        ok = false;
      } else {
        setFirstNameHint('');
      }

      if (!last) {
        setLastNameHint('Le nom est requis.');
        ok = false;
      } else if (last.length < 2) {
        setLastNameHint('Le nom doit contenir au moins 2 caractères.');
        ok = false;
      } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(last)) {
        setLastNameHint('Utilisez uniquement des lettres (é, è, - et apostrophe autorisés).');
        ok = false;
      } else {
        setLastNameHint('');
      }

      const emailValidation = validateEmail(form.email.trim());
      if (!emailValidation.valid) {
        setEmailStatus('invalid');
        setEmailHint(emailValidation.message);
        ok = false;
      }

      const phoneValidation = validatePhone(form.phone);
      if (!phoneValidation.valid) {
        setPhoneStatus('invalid');
        setPhoneHint(phoneValidation.message);
        ok = false;
      }

      if (form.password !== form.confirmPassword) {
        setConfirmHint('Les mots de passe ne correspondent pas.');
        ok = false;
      } else {
        setConfirmHint('');
      }

      const pwdRes = validatePassword(form.password);
      if (!pwdRes.valid) {
        setPasswordHint(pwdRes.message || 'Mot de passe non conforme.');
        ok = false;
      } else {
        setPasswordHint('');
      }

      if (!ok) return;

    setChecking(true);
    try {
      const [emailExists, phoneExists] = await Promise.all([
        checkEmailExists(form.email.trim()),
        checkPhoneExists(form.phone.trim()),
      ]);

        if (emailExists) {
          setEmailStatus('invalid');
          setEmailHint('Cet email est déjà utilisé.');
          ok = false;
        }

        if (phoneExists) {
          setPhoneStatus('invalid');
          setPhoneHint('Ce numéro est déjà utilisé.');
          ok = false;
        }
      } catch (validationError: any) {
        setChecking(false);
        setError(
          validationError?.message ||
            'Impossible de vérifier vos informations. Réessayez.'
        );
        return;
      }

      setChecking(false);
      if (!ok) return;
    setLoading(true);

    try {
      await signUp(
        form.email.trim(),
        form.password,
        form.firstName.trim(),
        form.lastName.trim(),
        form.phone.trim()
      );

      router.push('/auth/verify');
    } catch (signupError: any) {
      setError(signupError?.message || 'Impossible de créer votre compte. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

    return (
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8 lg:p-8">
        <a
          href="/auth/login"
          className="absolute left-4 top-4 z-10 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
          aria-label="Retour à la connexion"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Créez votre compte
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Rejoignez Pizza King et profitez des meilleures offres.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        className="space-y-4 sm:space-y-6"
        onSubmit={handleSubmit}
        noValidate
      >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                Prénom
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={event => handleChange('firstName', event.target.value)}
                autoComplete="given-name"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="Jean"
                required
              />
              {firstNameHint && (
                <p className="text-xs text-red-600">{firstNameHint}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                Nom
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={event => handleChange('lastName', event.target.value)}
                autoComplete="family-name"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="Dupont"
                required
              />
              {lastNameHint && (
                <p className="text-xs text-red-600">{lastNameHint}</p>
              )}
            </div>
          </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={event => handleChange('email', event.target.value)}
                autoComplete="email"
                aria-invalid={emailStatus === 'invalid'}
                aria-describedby="signup-email-help"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-12 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="vous@example.com"
                required
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {emailStatus === 'checking' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden />
                ) : emailStatus === 'valid' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                ) : emailStatus === 'invalid' ? (
                  <XCircle className="h-4 w-4 text-red-500" aria-hidden />
                ) : null}
              </div>
            </div>
            {emailHint && (
              <p
                id="signup-email-help"
                className={`text-xs ${
                  emailStatus === 'invalid'
                    ? 'text-red-600'
                    : emailStatus === 'valid'
                      ? 'text-emerald-600'
                      : 'text-gray-500'
                }`}
              >
                {emailHint}
              </p>
            )}
          {/* Pas de message d'erreur sous l'email (demandé) */}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Téléphone</label>
          <div className="relative">
            <PhoneInput
              international
              defaultCountry="FR"
              value={form.phone || undefined}
              onChange={value => handleChange('phone', value ?? '')}
              className="PhoneInput"
              numberInputProps={{
                required: true,
                'aria-invalid': phoneStatus === 'invalid',
                'aria-describedby': 'signup-phone-help',
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
              ) : phoneStatus === 'valid' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
              ) : phoneStatus === 'invalid' ? (
                <XCircle className="h-4 w-4 text-red-500" aria-hidden />
              ) : null}
            </div>
          </div>
          {phoneHint && (
            <p
              id="signup-phone-help"
              className={`text-xs ${
                phoneStatus === 'invalid'
                  ? 'text-red-600'
                  : phoneStatus === 'valid'
                    ? 'text-emerald-600'
                    : 'text-gray-500'
              }`}
            >
              {phoneHint}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Mot de passe
          </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={event => handleChange('password', event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-12 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 z-10 flex items-center p-2 text-gray-500 hover:text-gray-700 pointer-events-auto"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 pointer-events-none" />
                ) : (
                  <Eye className="h-5 w-5 pointer-events-none" />
                )}
              </button>
            </div>
          {passwordHint && (
            <p className="text-xs text-red-600">{passwordHint}</p>
          )}
          <div className="mt-2 grid grid-cols-1 gap-1.5 text-xs sm:text-xs">
            <div className={`${passChecks.length ? 'text-emerald-600' : 'text-gray-500'}`}>
              • Au moins 8 caractères {passChecks.length ? '✓' : ''}
            </div>
            <div className={`${passChecks.upper ? 'text-emerald-600' : 'text-gray-500'}`}>
              • Une majuscule (A‑Z) {passChecks.upper ? '✓' : ''}
            </div>
            <div className={`${passChecks.lower ? 'text-emerald-600' : 'text-gray-500'}`}>
              • Une minuscule (a‑z) {passChecks.lower ? '✓' : ''}
            </div>
            <div className={`${passChecks.digit ? 'text-emerald-600' : 'text-gray-500'}`}>
              • Un chiffre (0‑9) {passChecks.digit ? '✓' : ''}
            </div>
            <div className={`${passChecks.special ? 'text-emerald-600' : 'text-gray-500'}`}>
              • Un caractère spécial (!@#$…)
            </div>
            <div className="text-gray-500">
              Exemples: Pizza#2024, King!89ab, Pk@Secure9
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Confirmer le mot de passe
          </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={event =>
                  handleChange('confirmPassword', event.target.value)
                }
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-12 text-base sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 z-10 flex items-center p-2 text-gray-500 hover:text-gray-700 pointer-events-auto"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                aria-label={
                  showConfirmPassword
                    ? 'Masquer la confirmation'
                    : 'Afficher la confirmation'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 pointer-events-none" />
                ) : (
                  <Eye className="h-5 w-5 pointer-events-none" />
                )}
              </button>
            </div>
          {confirmHint && (
            <p className="text-xs text-red-600">{confirmHint}</p>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-3 text-xs text-gray-600 sm:gap-4 sm:p-4">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <p className="text-xs sm:text-sm">
            En créant un compte, vous acceptez nos{' '}
            <a
              href="/terms"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Conditions d’utilisation
            </a>{' '}
            et notre{' '}
            <a
              href="/privacy"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Politique de confidentialité
            </a>
            .
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || checking}
          className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(loading || checking) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {checking
            ? 'Vérification…'
            : loading
              ? 'Création du compte…'
              : 'S’inscrire'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Vous avez déjà un compte ?{' '}
        <a
          href="/auth/login"
          className="font-medium text-orange-600 hover:text-orange-500"
        >
          Connectez-vous
        </a>
      </p>
    </div>
  );
}
