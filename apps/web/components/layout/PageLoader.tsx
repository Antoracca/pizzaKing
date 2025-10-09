'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Pizza } from 'lucide-react';

export default function PageLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // First load only
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    // Show loader on route change (navigation between pages)
    setIsLoading(true);

    // Hide loader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          {/* Simple animated loader for navigation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl"
          >
            {/* Rotating Pizza Icon */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="relative"
            >
              <Pizza className="h-12 w-12 text-orange-500 sm:h-14 sm:w-14" />

              {/* Subtle glow */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 -z-10 rounded-full bg-orange-400 blur-lg"
              />
            </motion.div>

            {/* Loading dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
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
