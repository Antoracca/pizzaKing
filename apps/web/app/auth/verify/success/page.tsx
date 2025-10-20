'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';

export default function VerifySuccessPage() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const [secondsRemaining, setSecondsRemaining] = useState(5);

  useEffect(() => {
    // Nettoyer les données d'inscription du sessionStorage après succès
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('pk_signup_success');
        window.sessionStorage.removeItem('pk_signup_email');
        window.sessionStorage.removeItem('pk_signup_phone');
      }
    } catch { /* empty */ }

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Attendre que l'état utilisateur soit à jour puis rediriger
          if (user && firebaseUser) {
            console.log('✅ Utilisateur connecté, redirection...');
            router.replace('/');
          } else {
            console.log('⚠️ État utilisateur pas encore à jour, force refresh...');
            window.location.href = '/';
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-3xl bg-white p-10 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Compte vérifié avec succès
        </h1>
        <p className="text-sm text-gray-600">
          Merci d’avoir confirmé votre email. Votre compte Pizza King est
          maintenant activé. Vous allez être redirigé automatiquement.
        </p>

        <p className="text-sm font-medium text-gray-700">
          Redirection dans{' '}
          <span className="text-orange-600">{secondsRemaining}</span> secondes…
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              if (user && firebaseUser) {
                router.replace('/');
              } else {
                window.location.href = '/';
              }
            }}
            className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 sm:w-auto"
          >
            Aller à l'accueil
          </button>
          <button
            type="button"
            onClick={() => {
              if (user && firebaseUser) {
                router.replace('/account');
              } else {
                window.location.href = '/account';
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
          >
            Voir mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
