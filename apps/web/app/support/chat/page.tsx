'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SupportChat from '@/components/support/SupportChat';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import { useNavLoading } from '@/hooks/useNavLoading';

export default function SupportChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { start, stop } = useNavLoading();
  const isReady = Boolean(user && !loading);
  const shouldShowGuard = !isReady;

  useEffect(() => {
    if (shouldShowGuard) {
      start();
    } else {
      stop();
    }
    return () => {
      stop();
    };
  }, [shouldShowGuard, start, stop]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/support/chat');
    }
  }, [loading, user, router]);

  if (!isReady) {
    return null;
  }

  return <SupportChat />;
}
