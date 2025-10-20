'use client';

import { AuthProvider as SharedAuthProvider } from '@pizza-king/shared/src/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SharedAuthProvider auth={auth} db={db}>
      {children}
    </SharedAuthProvider>
  );
}
