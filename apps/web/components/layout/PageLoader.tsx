'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Pizza } from 'lucide-react';
import { useNavLoading } from '@/hooks/useNavLoading';

export default function PageLoader() {
  const pathname = usePathname();
  const { loading, stop } = useNavLoading();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [startPath, setStartPath] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialLoad) setIsInitialLoad(false);
  }, [isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;
    const timer = setTimeout(() => stop(), 300);
    return () => clearTimeout(timer);
  }, [pathname, stop, isInitialLoad]);

  // Watchdog: if loading starts but the route doesn't change (e.g., clicking same page), stop after 800ms
  useEffect(() => {
    if (loading) {
      setStartPath(pathname);
      const t = setTimeout(() => {
        if (startPath === pathname) stop();
      }, 800);
      return () => clearTimeout(t);
    }
    return;
  }, [loading, pathname, startPath, stop]);

  // Stop the loader right after new route content is attached in DOM
  useEffect(() => {
    if (!loading) return;
    const viewport = document.getElementById('route-viewport');
    if (!viewport) return;

    const handleSettled = () => {
      // give a frame to paint
      requestAnimationFrame(() => stop());
    };

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && (m.attributeName === 'data-route' || m.attributeName === 'class')) {
          handleSettled();
          break;
        }
        if (m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
          handleSettled();
          break;
        }
      }
    });
    observer.observe(viewport, { attributes: true, attributeFilter: ['data-route', 'class'], childList: true, subtree: true });

    return () => observer.disconnect();
  }, [loading, stop]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="relative"
            >
              <Pizza className="h-12 w-12 text-orange-500 sm:h-14 sm:w-14" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 -z-10 rounded-full bg-orange-400 blur-lg"
              />
            </motion.div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="h-2 w-2 rounded-full bg-orange-500"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
