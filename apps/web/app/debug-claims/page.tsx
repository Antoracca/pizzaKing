'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';

export default function DebugClaimsPage() {
  const { firebaseUser, user } = useAuth();
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClaims() {
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          setClaims(tokenResult.claims);
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
      setLoading(false);
    }
    loadClaims();
  }, [firebaseUser]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">🔐 Debug JWT Claims</h1>

        {loading ? (
          <div className="rounded-lg bg-white p-6 shadow">
            <p>Chargement...</p>
          </div>
        ) : !firebaseUser ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <p className="text-red-800 font-semibold">❌ Pas d'utilisateur connecté</p>
            <p className="text-red-600 text-sm mt-2">
              Retourne à <a href="/auth/login" className="underline">la page de connexion</a>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Firebase User Info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">👤 Firebase User</h2>
              <div className="space-y-2 text-sm">
                <p><strong>UID:</strong> {firebaseUser.uid}</p>
                <p><strong>Email:</strong> {firebaseUser.email}</p>
                <p><strong>Email vérifié:</strong> {firebaseUser.emailVerified ? '✅' : '❌'}</p>
              </div>
            </div>

            {/* Firestore User Info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">📄 Firestore User</h2>
              {user ? (
                <div className="space-y-2 text-sm">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role (Firestore):</strong> <span className="font-bold text-orange-600">{user.role || '❌ undefined'}</span></p>
                  <p><strong>Nom:</strong> {user.firstName} {user.lastName}</p>
                </div>
              ) : (
                <p className="text-red-600">❌ Pas de document Firestore trouvé</p>
              )}
            </div>

            {/* JWT Claims */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">🔐 JWT Token Claims</h2>
              {claims ? (
                <div className="space-y-4">
                  <div className="rounded bg-slate-100 p-4">
                    <p className="mb-2"><strong>Role dans JWT:</strong></p>
                    {claims.role ? (
                      <p className="text-2xl font-bold text-green-600">✅ {claims.role}</p>
                    ) : (
                      <p className="text-2xl font-bold text-red-600">❌ undefined (pas de custom claim!)</p>
                    )}
                  </div>

                  <details className="cursor-pointer">
                    <summary className="font-semibold text-slate-700">Tous les claims (cliquer pour voir)</summary>
                    <pre className="mt-4 overflow-auto rounded bg-slate-800 p-4 text-xs text-green-400">
{JSON.stringify(claims, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <p className="text-red-600">❌ Impossible de récupérer les claims</p>
              )}
            </div>

            {/* Diagnostic */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">🔍 Diagnostic</h2>
              {!claims?.role ? (
                <div className="space-y-3 text-sm text-blue-800">
                  <p className="font-semibold text-red-600">❌ PROBLÈME DÉTECTÉ : Pas de custom claim 'role' dans ton JWT</p>
                  <p><strong>Solutions possibles :</strong></p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                      <strong>Déconnecte-toi et reconnecte-toi</strong> - Firebase doit générer un nouveau JWT
                    </li>
                    <li>
                      Si le problème persiste, la fonction <code className="bg-blue-100 px-1 rounded">onUserCreate</code> n'a peut-être pas ajouté le claim
                    </li>
                    <li>
                      Vérifie les logs dans Firebase Console → Functions
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-green-800">
                  <p className="font-semibold">✅ Tout est OK !</p>
                  <p>Ton JWT contient le custom claim <code className="bg-green-100 px-1 rounded font-bold">role: {claims.role}</code></p>
                  <p>Les règles Firestore devraient fonctionner correctement.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-orange-500 px-6 py-3 text-white font-semibold hover:bg-orange-600"
              >
                🔄 Recharger la page
              </button>
              <a
                href="/support/chat"
                className="rounded-lg bg-blue-500 px-6 py-3 text-white font-semibold hover:bg-blue-600"
              >
                💬 Tester le chat support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
