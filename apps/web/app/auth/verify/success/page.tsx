'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function VerifySuccessPage() {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-3xl bg-white p-10 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900">Compte vérifié avec succès</h1>
        <p className="text-sm text-gray-600">
          Merci d’avoir confirmé votre email. Votre compte Pizza King est maintenant activé. Vous allez être redirigé automatiquement.
        </p>

        <p className="text-sm font-medium text-gray-700">
          Redirection dans <span className="text-orange-600">{secondsRemaining}</span> secondes…
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 sm:w-auto"
          >
            Aller à l’accueil
          </button>
          <button
            type="button"
            onClick={() => router.push('/account')}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
          >
            Voir mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
