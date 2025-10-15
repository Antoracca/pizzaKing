'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@pizza-king/shared';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyPage() {
  const router = useRouter();
  const { firebaseUser, loading } = useAuth();
  const [status, setStatus] = useState<string>('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace('/auth/login');
    }
    if (!loading && firebaseUser?.emailVerified) {
      router.replace('/account');
    }
  }, [firebaseUser, loading, router]);

  const handleResendEmail = async () => {
    if (!firebaseUser) return;
    setStatus('');
    setSending(true);
    try {
      await sendEmailVerification(firebaseUser);
      setStatus("Email de vérification envoyé. Vérifiez votre boîte mail.");
    } catch (e: any) {
      setStatus(e?.message || "Échec de l'envoi de l'email de vérification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-white rounded-2xl shadow p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Vérifiez votre compte</h1>
          <p className="mt-2 text-gray-600">
            Choisissez une méthode de vérification pour activer votre compte.
          </p>
        </div>

        {status && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{status}</div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            disabled={sending}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {sending ? 'Envoi...' : "Vérifier par e‑mail"}
          </button>

          <button
            onClick={() => router.push('/account?verify=1')}
            className="w-full border border-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Vérifier par numéro de téléphone
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Une fois vérifié, vous serez redirigé vers votre compte.
        </p>
      </div>
    </div>
  );
}

