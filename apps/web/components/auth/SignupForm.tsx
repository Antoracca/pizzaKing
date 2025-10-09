'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@pizza-king/shared';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePhone, validatePassword, checkEmailExists, checkPhoneExists } from '@/lib/auth/validation';
import AuthAlert from './AuthAlert';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const { signUp, signInWithGoogle, user } = useAuth();
  const router = useRouter();

  // Redirect to home when user is authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return;
    }

    // Phone validation
    const phoneValidation = validatePhone(formData.phoneNumber);
    if (!phoneValidation.valid) {
      setError(phoneValidation.message);
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    // Check if email or phone already exists
    setChecking(true);
    const [emailExists, phoneExists] = await Promise.all([
      checkEmailExists(formData.email),
      checkPhoneExists(formData.phoneNumber),
    ]);
    setChecking(false);

    if (emailExists) {
      setError('Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.');
      return;
    }

    if (phoneExists) {
      setError('Ce numéro de téléphone est déjà utilisé. Utilisez un autre numéro.');
      return;
    }

    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phoneNumber
      );
      setSuccess('Compte créé avec succès! Redirection...');
      // Redirect will happen automatically via useEffect when user state updates
    } catch (err: any) {
      // Translate Firebase errors
      let errorMessage = "Erreur lors de l'inscription";

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé. Essayez de vous connecter.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible. Utilisez un mot de passe plus fort.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      // Redirect will happen automatically via useEffect when user state updates
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion avec Google');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Inscription</h2>
        <p className="mt-2 text-gray-600">
          Créez votre compte Pizza King
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthAlert type="error" message={error} show={!!error} />
        <AuthAlert type="success" message={success} show={!!success} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Jean"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Dupont"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Téléphone
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="+226 70 12 34 56"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="••••••••"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Minimum 8 caractères, avec majuscule, minuscule et caractère spécial
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            required
            className="w-4 h-4 mt-1 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            J'accepte les{' '}
            <a href="/terms" className="text-orange-600 hover:text-orange-500">
              conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="/privacy" className="text-orange-600 hover:text-orange-500">
              politique de confidentialité
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || checking}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? 'Vérification...' : loading ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </button>

      <p className="text-center text-sm text-gray-600">
        Vous avez déjà un compte ?{' '}
        <a
          href="/auth/login"
          className="text-orange-600 hover:text-orange-500 font-medium"
        >
          Connectez-vous
        </a>
      </p>
    </div>
  );
}
