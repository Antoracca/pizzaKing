'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ForceRefreshHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const verificationSuccess = window.sessionStorage.getItem('pk_verification_success');
        const forceRefresh = window.sessionStorage.getItem('pk_force_refresh');
        
        // Si l'utilisateur vient de finir la vérification et arrive sur la page d'accueil
        if (verificationSuccess && pathname === '/') {
          window.sessionStorage.removeItem('pk_verification_success');
          console.log('🔄 Refresh après vérification réussie');
          // Petit délai pour laisser le temps au provider de se mettre à jour
          setTimeout(() => {
            window.location.reload();
          }, 100);
          return;
        }
        
        // Ancien système de force refresh
        if (forceRefresh) {
          window.sessionStorage.removeItem('pk_force_refresh');
          console.log('🔄 Force refresh demandé');
          window.location.reload();
        }
      }
    } catch { /* empty */ }
  }, [router, pathname]);

  return null;
}