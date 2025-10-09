'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@pizza-king/shared';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait for auth to complete, then redirect to home
    if (!loading && user) {
      router.push('/');
    } else if (!loading && !user) {
      // If no user after loading, redirect to login with error
      router.push('/auth/login?error=auth_failed');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <div className="mb-6">
          <svg
            className="animate-spin h-16 w-16 text-orange-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connexion en cours...
        </h2>
        <p className="text-gray-600">
          Veuillez patienter pendant que nous finalisons votre authentification.
        </p>
      </div>
    </div>
  );
}
