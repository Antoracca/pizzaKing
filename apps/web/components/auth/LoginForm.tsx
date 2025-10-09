'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@pizza-king/shared';
import { useRouter } from 'next/navigation';
import { validateEmail, checkEmailExists, checkIsGoogleUser } from '@/lib/auth/validation';
import AuthAlert from './AuthAlert';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const hasAttemptedAuth = useRef(false);

  // Only redirect if we just logged in (not on initial page load)
  useEffect(() => {
    if (user && hasAttemptedAuth.current && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSignupPrompt(false);
    setShowGooglePrompt(false);
    setLoading(true);

    // Email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      setLoading(false);
      return;
    }

    // Check if email exists in Firestore
    setChecking(true);
    const emailExists = await checkEmailExists(email);

    if (!emailExists) {
      setShowSignupPrompt(true);
      setChecking(false);
      setLoading(false);
      return;
    }

    // Check if user signed in with Google
    const isGoogleUser = await checkIsGoogleUser(email);
    setChecking(false);

    if (isGoogleUser) {
      setShowGooglePrompt(true);
      setLoading(false);
      return;
    }

    try {
      hasAttemptedAuth.current = true;
      await signIn(email, password);
      // Redirect will happen automatically via useEffect when user state updates
    } catch (err: any) {
      hasAttemptedAuth.current = false;
      // Translate Firebase errors to French
      let errorMessage = 'Erreur lors de la connexion';

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Désolé, le mot de passe est incorrect. Veuillez vérifier vos identifiants.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Veuillez entrer une adresse email valide';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Ce compte a été désactivé. Contactez le support.';
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
      // This will redirect the user to Google
      // No need to set hasAttemptedAuth because the page will reload after redirect
      await signInWithGoogle();
      // User will be redirected to Google, then back to the app
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la connexion avec Google';

      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Connexion annulée. Veuillez réessayer.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Un compte existe déjà avec le même email mais un autre fournisseur d\'authentification.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Connexion</h2>
        <p className="mt-2 text-gray-600">
          Connectez-vous à votre compte Pizza King
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthAlert type="error" message={error} show={!!error} />

        {showSignupPrompt && (
          <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
            <p className="flex-1 text-sm font-medium text-orange-800">
              Aucun compte trouvé avec cet email. Voulez-vous créer un compte ?
            </p>
            <a
              href="/auth/signup"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Oui
            </a>
          </div>
        )}

        {showGooglePrompt && (
          <div className="flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 mb-3">
                Ce compte a été créé avec Google. Veuillez utiliser la connexion Google ci-dessous.
              </p>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-white border border-blue-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-blue-50 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                Se connecter avec Google
              </button>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="votre@email.com"
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
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
          </label>
          <a
            href="/auth/reset-password"
            className="text-sm text-orange-600 hover:text-orange-500"
          >
            Mot de passe oublié ?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading || checking}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {(loading || checking) && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {checking ? 'Vérification...' : loading ? 'Connexion en cours...' : 'Se connecter'}
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
        Pas encore de compte ?{' '}
        <a
          href="/auth/signup"
          className="text-orange-600 hover:text-orange-500 font-medium"
        >
          Inscrivez-vous
        </a>
      </p>
    </div>
  );
}
