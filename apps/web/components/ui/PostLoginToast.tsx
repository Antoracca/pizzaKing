'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type ToastVariant = 'success' | 'warning' | 'info';

type ToastPayload = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastState = {
  title: string | null;
  description: string;
  variant: ToastVariant;
};

export default function PostLoginToast() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    title: null,
    description: '',
    variant: 'info',
  });

  const Icon = useMemo(() => {
    switch (toast.variant) {
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle2;
      default:
        return Info;
    }
  }, [toast.variant]);

  // Gestion des toasts déclenchés côté client (ex: custom events)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (event: Event) => {
      const custom = event as CustomEvent<ToastPayload | undefined>;
      const detail = custom.detail ?? {};
      setToast({
        title: detail.title ?? null,
        description:
          detail.description ??
          "Un message a été reçu mais aucune description n'a été fournie.",
        variant: detail.variant ?? 'info',
      });
      setShow(true);
    };

    window.addEventListener('pk-toast', handler as EventListener);

    return () => {
      window.removeEventListener('pk-toast', handler as EventListener);
    };
  }, []);

  // Toasts post-authentification (uniquement sur la page d'accueil)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname !== '/') return;

    const emailFlag = window.sessionStorage.getItem('pk_email_login_success');
    const phoneFlag = window.sessionStorage.getItem('pk_phone_login_success');
    const googleFlag = window.sessionStorage.getItem('pk_google_login_success');

    if (emailFlag === '1') {
      setToast({
        title: null,
        description: "Connexion via l'e-mail réussie",
        variant: 'success',
      });
      setShow(true);
      window.sessionStorage.removeItem('pk_email_login_success');
    } else if (phoneFlag === '1') {
      setToast({
        title: null,
        description: 'Connexion via le numéro de téléphone réussie',
        variant: 'success',
      });
      setShow(true);
      window.sessionStorage.removeItem('pk_phone_login_success');
    } else if (googleFlag === '1') {
      setToast({
        title: null,
        description: 'Connexion Google réussie',
        variant: 'success',
      });
      setShow(true);
      window.sessionStorage.removeItem('pk_google_login_success');
    }
  }, [pathname]);

  // Masquer automatiquement après 5 secondes
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

  const IconComponent = Icon;

  return (
    <div className="fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4">
      <div className="flex max-w-sm items-start gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">
        <IconComponent
          className={`mt-0.5 h-4 w-4 ${
            toast.variant === 'warning'
              ? 'text-yellow-400'
              : toast.variant === 'success'
              ? 'text-emerald-400'
              : 'text-blue-300'
          }`}
          aria-hidden
        />
        <div className="flex-1 space-y-1">
          {toast.title ? (
            <p className="text-sm font-semibold leading-tight">{toast.title}</p>
          ) : null}
          <p className="text-sm leading-snug text-gray-100">{toast.description}</p>
        </div>
      </div>
    </div>
  );
}
