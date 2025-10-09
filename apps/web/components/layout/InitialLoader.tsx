'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pizza } from 'lucide-react';

export default function InitialLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loader after initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-orange-600"
        >
          {/* Animated Pizza Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Pizza className="h-20 w-20 text-white sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
            </motion.div>

            {/* Pulsing glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 -z-10 rounded-full bg-white blur-2xl"
            />
          </motion.div>

          {/* Loading text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute bottom-1/3 flex flex-col items-center gap-4"
          >
            <p className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
              Pizza King
            </p>
            <p className="text-sm font-medium text-white/90 sm:text-base">
              Préparez vos papilles...
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="h-2.5 w-2.5 rounded-full bg-white"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
