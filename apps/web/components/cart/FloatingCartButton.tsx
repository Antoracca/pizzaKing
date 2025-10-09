'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingCart } from 'lucide-react';

import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function FloatingCartButton() {
  const { itemCount, subtotal, openCart, isOpen } = useCart();

  const handleClick = () => {
    if (!isOpen) {
      openCart();
    }
  };

  return (
    <AnimatePresence>
      {itemCount > 0 && !isOpen && (
        <motion.button
          type="button"
          onClick={handleClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-4 z-[65] inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-left shadow-2xl shadow-orange-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:bottom-8 sm:right-8 sm:px-6"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-orange-600 shadow-md">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <span className="flex flex-col text-sm font-semibold text-white sm:text-base">
            <span className="text-xs font-medium uppercase tracking-wide text-white/80">
              Voir mon panier
            </span>
            <span>
              {itemCount} article{itemCount > 1 ? 's' : ''} - {formatPrice(subtotal)}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 text-white/90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
