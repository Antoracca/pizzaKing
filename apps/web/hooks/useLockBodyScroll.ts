'use client';

import { useEffect } from 'react';

/**
 * Locks body scroll when the cart sidebar is open to avoid background interaction.
 * Adds minimal scrollbar compensation to prevent layout shift on desktop browsers.
 */
export function useLockBodyScroll(shouldLock: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const body = document.body;
    const root = document.documentElement;

    if (!shouldLock) {
      return;
    }

    // Save current scroll position
    const scrollY = window.scrollY;
    const previousOverflow = body.style.overflow;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousWidth = body.style.width;
    const previousPaddingRight = body.style.paddingRight;
    const previousOverscroll = root.style.overscrollBehavior;
    const scrollBarCompensation = window.innerWidth - root.clientWidth;

    // Lock scroll with position fixed to prevent any scrolling
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    if (scrollBarCompensation > 0) {
      body.style.paddingRight = `${scrollBarCompensation}px`;
    }

    root.style.overscrollBehavior = 'contain';

    // Prevent touch move on iOS
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Allow scrolling inside the sidebar
      if (target.closest('[role="dialog"]')) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventTouchMove);

      body.style.overflow = previousOverflow;
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      body.style.paddingRight = previousPaddingRight;
      root.style.overscrollBehavior = previousOverscroll;

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [shouldLock]);
}
