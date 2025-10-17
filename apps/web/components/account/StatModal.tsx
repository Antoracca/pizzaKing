'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBackground: string;
  children: React.ReactNode;
};

export default function StatModal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  iconColor,
  iconBackground,
  children,
}: Props) {
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBackground}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
                {children}
              </div>

              {/* Footer optionnel */}
              <div className="border-t border-gray-100 px-6 py-4">
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-red-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-orange-700 hover:to-red-700"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
