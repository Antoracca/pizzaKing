'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function PostLoginToast() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const emailFlag = window.sessionStorage.getItem('pk_email_login_success');
    const phoneFlag = window.sessionStorage.getItem('pk_phone_login_success');
    if (pathname === '/') {
      if (emailFlag === '1') {
        setMessage("Connecté avec l'email");
        setShow(true);
        window.sessionStorage.removeItem('pk_email_login_success');
        const t = setTimeout(() => setShow(false), 2500);
        return () => clearTimeout(t);
      }
      if (phoneFlag === '1') {
        setMessage('Connecté avec le numéro de téléphone');
        setShow(true);
        window.sessionStorage.removeItem('pk_phone_login_success');
        const t = setTimeout(() => setShow(false), 2500);
        return () => clearTimeout(t);
      }
    }
    return;
  }, [pathname]);

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
