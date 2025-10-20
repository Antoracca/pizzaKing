'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SupportChat from '@/components/support/SupportChat';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';

export default function SupportChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/support/chat');
    }
  }, [loading, user, router]);

  const isReady = Boolean(user && !loading);

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm text-slate-600">Chargement du support...</p>
        </div>
      </div>
    );
  }

  return <SupportChat />;
}
