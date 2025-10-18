'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function PostLoginToast() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Check for login flags on mount and pathname change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname !== '/') return;

    const emailFlag = window.sessionStorage.getItem('pk_email_login_success');
    const phoneFlag = window.sessionStorage.getItem('pk_phone_login_success');
    const googleFlag = window.sessionStorage.getItem('pk_google_login_success');

    if (emailFlag === '1') {
      setMessage("Connecté avec l'email");
      setShow(true);
      window.sessionStorage.removeItem('pk_email_login_success');
    } else if (phoneFlag === '1') {
      setMessage('Connecté avec le numéro de téléphone');
      setShow(true);
      window.sessionStorage.removeItem('pk_phone_login_success');
    } else if (googleFlag === '1') {
      setMessage('Connexion avec Google réussie');
      setShow(true);
      window.sessionStorage.removeItem('pk_google_login_success');
    }
  }, [pathname]);

  // Auto-hide after 5 seconds when shown
  useEffect(() => {
    if (!show) return;

    const timeoutId = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
        <span>{message}</span>
      </div>
    </div>
  );
}
