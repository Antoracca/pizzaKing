'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNavLoading } from '@/hooks/useNavLoading';

export default function NavLoadingProvider() {
  const pathname = usePathname();
  const { start, stop } = useNavLoading();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    const startNav = () => start();
    const onPop = () => start();

    const isSameTarget = (url?: string | null) => {
      try {
        if (!url) return true;
        const to = new URL(url, window.location.href);
        return (
          to.origin === window.location.origin &&
          to.pathname === window.location.pathname &&
          to.search === window.location.search
        );
      } catch {
        return false;
      }
    };

    // Patch history to detect programmatic navigations (router push/replace)
    window.history.pushState = function (...args) {
      try {
        const url = (args && args[2]) as string | null;
        if (!isSameTarget(url)) startNav();
      } catch {}
      return originalPush.apply(this, args as any);
    } as typeof window.history.pushState;

    window.history.replaceState = function (...args) {
      try {
        const url = (args && args[2]) as string | null;
        if (!isSameTarget(url)) startNav();
      } catch {}
      return originalReplace.apply(this, args as any);
    } as typeof window.history.replaceState;

    // Back/forward
    window.addEventListener('popstate', onPop);

    // Also start on internal link clicks (as fallback)
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === '_blank') return;
      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('http')) return;
      // Resolve target and ignore if it's the same route (same path+search)
      try {
        const to = new URL(href, window.location.href);
        const same =
          to.origin === window.location.origin &&
          to.pathname === window.location.pathname &&
          to.search === window.location.search;
        if (!same) startNav();
      } catch {
        // if resolution fails, do nothing
      }
    };
    document.addEventListener('click', onClick, { capture: true });

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onClick, { capture: true } as any);
    };
  }, [start]);

  // Stop loading shortly after the pathname actually changed
  useEffect(() => {
    const timer = setTimeout(() => stop(), 300);
    return () => clearTimeout(timer);
  }, [pathname, stop]);

  return null;
}
