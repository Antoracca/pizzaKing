'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import SupportChat from '@/components/support/SupportChat';
import { useAuth } from '@pizza-king/shared';
import { useNavLoading } from '@/hooks/useNavLoading';

export default function SupportChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { start, stop } = useNavLoading();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/support/chat');
    }
  }, [loading, user, router]);

  const isReady = Boolean(user && !loading);

  useEffect(() => {
    if (!isReady) {
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [isReady, start, stop]);

  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen w-full max-w-5xl bg-gradient-to-b from-orange-50 via-white to-white px-4 py-10 sm:px-6 lg:px-8">
        {isReady ? <SupportChat /> : <div className="h-[60vh]" />}
      </main>
    </>
  );
}
