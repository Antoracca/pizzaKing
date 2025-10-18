'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, Pizza } from 'lucide-react';
import { useAuth } from '@pizza-king/shared';
import {
  validateEmail,
  checkEmailExists,
  checkIsGoogleUser,
} from '@/lib/auth/validation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    signIn,
    signInWithGoogle,
    resendEmailVerification,
    user,
    loading: authLoading,
  } = useAuth();
  const hasAttempted = useRef(false);

  const redirectParam = searchParams?.get('redirect');

  useEffect(() => {
    if (user && hasAttempted.current && !authLoading) {
      router.replace(redirectParam || '/');
    }
  }, [user, authLoading, router, redirectParam]);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setPendingVerification(false);

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return;
    }

    if (!password) {
      setError('Merci de saisir votre mot de passe.');
      return;
    }

    setChecking(true);
    try {
      const emailExists = await checkEmailExists(email);
      if (!emailExists) {
        setChecking(false);
        setInfo('Aucun compte trouvé. Vous pouvez vous inscrire.');
        return;
      }

      const isGoogle = await checkIsGoogleUser(email);
      if (isGoogle) {
        setChecking(false);
        setInfo(
          'Ce compte a été créé avec Google. Utilisez la connexion Google ci-dessous.'
        );
        return;
      }
    } catch (validationError: any) {
      setChecking(false);
      setError(
        validationError?.message ||
          'Impossible de vérifier votre compte. Réessayez.'
      );
      return;
    }

    setChecking(false);
    setLoading(true);

    try {
      hasAttempted.current = true;
      await signIn(email.trim(), password);
    } catch (signInError: any) {
      hasAttempted.current = false;
      let message = 'Connexion impossible. Vérifiez vos identifiants.';
      if (signInError?.code === 'auth/email-not-verified') {
        setPendingVerification(true);
        setInfo(
          signInError.message ||
            "Votre email n'est pas vérifié. Consultez votre boîte mail pour confirmer votre compte."
        );
        setLoading(false);
        return;
      }
      switch (signInError?.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Mot de passe incorrect. Réessayez.';
          break;
        case 'auth/user-not-found':
          message = 'Aucun compte trouvé avec cet email.';
          break;
        case 'auth/too-many-requests':
          message = 'Trop de tentatives. Réessayez plus tard.';
          break;
        case 'auth/network-request-failed':
          message = 'Problème réseau. Vérifiez votre connexion.';
          break;
        default:
          if (signInError?.message) message = signInError.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setError('');
    setInfo('');

    try {
      await resendEmailVerification(email.trim(), password);
      setInfo(
        "Un nouvel email de vérification vient d'être envoyé. Vérifiez votre boîte mail."
      );
    } catch (resendError: any) {
      setError(
        resendError?.message || "Impossible d'envoyer l'email de vérification."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setInfo('');
    setGoogleLoading(true);

    try {
      // signInWithPopup ouvre une popup Google pour l'authentification
      await signInWithGoogle();

      // Marquer le succès de la connexion Google
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('pk_google_login_success', '1');
        }
      } catch { /* empty */ }

      // Forcer un rechargement complet de la page pour mettre à jour l'état de connexion
      window.location.href = redirectParam || '/';
    } catch (googleError: any) {
      let message = 'Connexion Google impossible. Réessayez.';
      switch (googleError?.code) {
        case 'auth/popup-closed-by-user':
          message = 'Fenêtre fermée avant la validation.';
          break;
        case 'auth/cancelled-popup-request':
          message = 'Demande annulée. Réessayez.';
          break;
        case 'auth/popup-blocked':
          message = 'Popup bloquée par le navigateur. Autorisez les popups pour ce site.';
          break;
        case 'auth/network-request-failed':
          message = 'Problème réseau. Vérifiez votre connexion.';
          break;
        default:
          if (googleError?.message) message = googleError.message;
      }
      setError(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:max-w-lg sm:p-10">
      <div className="mb-6 flex flex-col gap-2 text-center sm:mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
          Bienvenue
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          Connectez-vous pour retrouver vos commandes et vos offres.
        </p>
      </div>

      {(error || info) && (
        <div
          className={`mb-6 rounded-2xl border p-4 text-sm font-medium sm:p-5 ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}
        >
          {error || info}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pl-11 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="vous@example.com"
              required
            />
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
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
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pl-11 pr-11 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="••••••••"
              required
            />
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600"
              aria-label={
                showPassword
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span>Se souvenir de moi</span>
          </label>
          <a
            className="font-medium text-orange-600 hover:text-orange-500"
            href="/auth/reset-password"
          >
            Mot de passe oublié ?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading || checking}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(loading || checking) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {checking ? 'Vérification…' : loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      {pendingVerification && (
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={resendLoading}
          className="mt-4 w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
        >
          {resendLoading
            ? 'Renvoi en cours…'
            : 'Renvoyer le mail de vérification'}
        </button>
      )}

      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        <span>Ou</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
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
        Continuer avec Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <a
          href="/auth/signup"
          className="font-medium text-orange-600 hover:text-orange-500"
        >
          Inscrivez-vous
        </a>
      </p>

      {/* Loader fullscreen - Connexion Google uniquement */}
      {googleLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-10 shadow-2xl">
            <div className="relative">
              <Pizza
                className="h-16 w-16 text-orange-500 animate-spin"
                style={{ animationDuration: '2s' }}
              />
              <div className="absolute inset-0 -z-10 rounded-full bg-orange-400 blur-xl opacity-30 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connexion avec Google en cours...
              </h3>
              <p className="text-sm text-gray-600">
                Authentification et création de votre session
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-orange-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
