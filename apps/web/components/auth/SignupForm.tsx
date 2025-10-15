'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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

  const router = useRouter();
  const { signUp } = useAuth();

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    // Basic required fields
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Merci de renseigner votre nom et prénom.');
      return;
    }

    const emailValidation = validateEmail(form.email.trim());
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return;
    }

    const phoneValidation = validatePhone(form.phone);
    if (!phoneValidation.valid) {
      setError(phoneValidation.message);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    setChecking(true);
    try {
      const [emailExists, phoneExists] = await Promise.all([
        checkEmailExists(form.email.trim()),
        checkPhoneExists(form.phone.trim()),
      ]);

      if (emailExists) {
        setError('Cet email est déjà utilisé. Utilisez un autre email ou essayez de vous connecter.');
        setChecking(false);
        return;
      }

      if (phoneExists) {
        setError('Ce numéro de téléphone est déjà utilisé.');
        setChecking(false);
        return;
      }
    } catch (validationError: any) {
      setChecking(false);
      setError(validationError?.message || 'Impossible de vérifier vos informations. Réessayez.');
      return;
    }

    setChecking(false);
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
      setError(signupError?.message || "Impossible de créer votre compte. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Créer un compte</h1>
        <p className="mt-2 text-sm text-gray-600">
          Inscrivez-vous pour accéder à Pizza King.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={event => handleChange('firstName', event.target.value)}
              autoComplete="given-name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="Jean"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={event => handleChange('lastName', event.target.value)}
              autoComplete="family-name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="Dupont"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={event => handleChange('email', event.target.value)}
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            placeholder="vous@example.com"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <PhoneInput
            international
            defaultCountry="FR"
            value={form.phone || undefined}
            onChange={value => handleChange('phone', value ?? '')}
            numberInputProps={{
              required: true,
              className:
                'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20',
            }}
            countrySelectProps={{
              className:
                'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={event => handleChange('confirmPassword', event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
          <p>
            En créant un compte, vous acceptez nos{' '}
            <a href="/terms" className="font-medium text-orange-600 hover:text-orange-500">
              Conditions d’utilisation
            </a>{' '}
            et notre{' '}
            <a href="/privacy" className="font-medium text-orange-600 hover:text-orange-500">
              Politique de confidentialité
            </a>
            .
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || checking}
          className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(loading || checking) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {checking ? 'Vérification…' : loading ? 'Création du compte…' : "S’inscrire"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Vous avez déjà un compte ?{' '}
        <a href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
          Connectez-vous
        </a>
      </p>
    </div>
  );
}
