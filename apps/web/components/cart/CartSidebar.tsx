'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Pizza,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { MEAL_BUNDLES } from '@/data/mealBundles';

const FREE_DELIVERY_THRESHOLD = 10000;
const DELIVERY_FEE = 1000;
const TAX_RATE = 0.18;

export default function CartSidebar() {
  const {
    items,
    isOpen,
    subtotal,
    closeCart,
    updateQuantity,
    updateItemSize,
    removeItem,
    clearCart,
    addItem,
  } = useCart();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD || items.length === 0
      ? 0
      : DELIVERY_FEE;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + deliveryFee + tax;

  const bundleSelections = items.filter(item => item.bundleId);
  const selectedBundleIds = new Set(
    bundleSelections.map(item => item.bundleId).filter(Boolean) as string[]
  );
  const missingBundles = MEAL_BUNDLES.filter(
    bundle => !selectedBundleIds.has(bundle.id)
  );
  const bundleDiscountLabel =
    selectedBundleIds.size >= 2 ? '8% de remise' : '5% de remise';

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeCart]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const raf = window.requestAnimationFrame(() => {
      node.focus();
    });

    return () => {
      window.cancelAnimationFrame(raf);
      previouslyFocusedElement?.focus?.();
    };
  }, [isOpen]);

  const handleAddBundle = (bundleId: (typeof MEAL_BUNDLES)[number]['id']) => {
    const bundle = MEAL_BUNDLES.find(entry => entry.id === bundleId);
    if (!bundle) {
      return;
    }

    addItem(
      {
        productId: `bundle-${bundle.id}`,
        name: bundle.name,
        description: bundle.subtitle,
        price: bundle.price,
        category: 'bundle',
        extras: bundle.items
          .filter(item => item.highlight)
          .map(item => item.text),
        metadata: {
          Économies: `-${formatPrice(bundle.savings)}`,
        },
        bundleId: bundle.id,
      },
      { openCart: true }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-full flex-col overflow-hidden bg-white shadow-2xl sm:max-w-md md:rounded-l-[32px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            tabIndex={-1}
            ref={containerRef}
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
              touchAction: 'none',
            }}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2
                    id="cart-title"
                    className="text-lg font-bold text-gray-900 sm:text-xl"
                  >
                    Votre Panier
                  </h2>
                  <p className="text-xs text-gray-600">
                    {items.length === 0
                      ? 'Ajoutez des pizzas pour commencer'
                      : `${items.length} ${items.length > 1 ? 'articles' : 'article'}`}
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200 sm:h-10 sm:w-10"
                  aria-label="Fermer le panier"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 transition-colors hover:text-red-500 active:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Vider le panier
                </button>
              )}
            </div>

            {/* Items */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-8 text-center sm:py-12"
                >
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-200 bg-gray-50 text-gray-300 sm:h-20 sm:w-20">
                    <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
                    Panier vide
                  </h3>
                  <p className="text-xs text-gray-600">
                    Découvrez notre menu et laissez-vous tenter.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  {items.map((item: any, index: number) => {
                    const selectedVariant =
                      item.priceVariants?.find(
                        (option: any) => option.id === item.sizeId
                      ) ?? item.priceVariants?.[0];

                    // Calculate dynamic prep time based on size and extras
                    const calculatePrepTime = () => {
                      if (!item.metadata?.prepTime) return null;

                      // Extract base time (e.g., "12-15 min" -> 12)
                      const baseTimeMatch =
                        item.metadata.prepTime.match(/(\d+)/);
                      if (!baseTimeMatch) return item.metadata.prepTime;

                      let baseTime = parseInt(baseTimeMatch[1], 10);

                      // Add time based on size
                      const sizeLabel =
                        selectedVariant?.label?.toLowerCase() || '';
                      if (
                        sizeLabel.includes('grande') ||
                        sizeLabel.includes('xl')
                      ) {
                        baseTime += 3;
                      } else if (sizeLabel.includes('xxl')) {
                        baseTime += 5;
                      }

                      // Add time based on extras (1 min per extra)
                      const extrasCount = item.extras?.length || 0;
                      baseTime += extrasCount;

                      return `${baseTime}-${baseTime + 3} min`;
                    };

                    const dynamicPrepTime = calculatePrepTime();
                    const isBundle =
                      item.bundleId || item.category === 'bundle';

                    return (
                      <motion.div
                        key={item.uid}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md sm:rounded-2xl sm:p-5 ${
                          isBundle
                            ? 'border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 hover:border-purple-300'
                            : 'border-gray-100 bg-white hover:border-orange-200'
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:gap-5">
                          {/* Top Section: Image + Info */}
                          <div className="flex gap-3 sm:gap-4">
                            {/* Image */}
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24 sm:rounded-xl">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 text-orange-500">
                                  <Pizza
                                    className="h-8 w-8"
                                    aria-hidden="true"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
                                      {item.name}
                                    </h4>
                                    {isBundle && (
                                      <Badge className="bg-purple-600 text-[10px] font-bold text-white">
                                        Menu
                                      </Badge>
                                    )}
                                  </div>
                                  {item.sizeLabel || item.crustLabel ? (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {item.sizeLabel && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] sm:text-xs"
                                        >
                                          {item.sizeLabel}
                                        </Badge>
                                      )}
                                      {item.crustLabel && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] sm:text-xs"
                                        >
                                          {item.crustLabel}
                                        </Badge>
                                      )}
                                    </div>
                                  ) : null}
                                </div>

                                <button
                                  onClick={() => removeItem(item.uid)}
                                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-100 sm:h-8 sm:w-8"
                                  aria-label="Retirer l'article"
                                >
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                              </div>

                              {/* Bundle items display */}
                              {isBundle &&
                                item.extras &&
                                item.extras.length > 0 && (
                                  <div className="mt-2 rounded-lg border border-purple-100 bg-purple-50/50 p-2.5">
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 sm:text-[11px]">
                                      Inclus dans le menu
                                    </p>
                                    <div className="space-y-1">
                                      {item.extras.map(
                                        (extra: string, idx: number) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-1.5 text-[11px] text-purple-900 sm:text-xs"
                                          >
                                            <svg
                                              className="h-3 w-3 flex-shrink-0 text-purple-600"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            <span>{extra}</span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Dynamic metadata display */}
                              <div className="mt-2 flex flex-wrap gap-2">
                                {dynamicPrepTime && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600 sm:text-[11px]">
                                    <svg
                                      className="h-3 w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {dynamicPrepTime}
                                  </span>
                                )}
                                {selectedVariant?.description && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[10px] font-medium text-orange-600 sm:text-[11px]">
                                    <svg
                                      className="h-3 w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                      />
                                    </svg>
                                    {selectedVariant.description}
                                  </span>
                                )}
                                {!isBundle &&
                                  item.extras &&
                                  item.extras.length > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-[10px] font-medium text-purple-600 sm:text-[11px]">
                                      <svg
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                      </svg>
                                      {item.extras.length} supplément
                                      {item.extras.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                {item.metadata &&
                                  Object.entries(item.metadata)
                                    .filter(
                                      ([key]) =>
                                        key !== 'prepTime' && key !== 'Portions'
                                    )
                                    .map(([key, value]) => (
                                      <span
                                        key={key}
                                        className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[10px] font-medium text-green-600 sm:text-[11px]"
                                      >
                                        <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                        {key}: {String(value)}
                                      </span>
                                    ))}
                              </div>
                            </div>
                          </div>

                          {/* Size Selection Section - Full Width */}
                          {item.priceVariants &&
                            item.priceVariants.length > 0 && (
                              <div className="w-full">
                                <div className="mb-2.5">
                                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 sm:text-sm">
                                    Taille
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                  {item.priceVariants.map((variant: any) => {
                                    const isActive =
                                      variant.id ===
                                      (item.sizeId ?? selectedVariant?.id);

                                    // Convertir les labels en format court
                                    let sizeLabel = variant.label;
                                    if (
                                      variant.label
                                        .toLowerCase()
                                        .includes('petite')
                                    )
                                      sizeLabel = 'S';
                                    else if (
                                      variant.label
                                        .toLowerCase()
                                        .includes('moyenne')
                                    )
                                      sizeLabel = 'M';
                                    else if (
                                      variant.label
                                        .toLowerCase()
                                        .includes('grande')
                                    )
                                      sizeLabel = 'L';
                                    else if (
                                      variant.label.toLowerCase().includes('xl')
                                    )
                                      sizeLabel = 'XL';
                                    else if (
                                      variant.label
                                        .toLowerCase()
                                        .includes('xxl')
                                    )
                                      sizeLabel = 'XXL';

                                    return (
                                      <button
                                        key={variant.id}
                                        type="button"
                                        onClick={() =>
                                          updateItemSize(item.uid, variant.id)
                                        }
                                        className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 bg-white py-2.5 transition-all sm:gap-1.5 sm:py-3 ${
                                          isActive
                                            ? 'border-orange-500 bg-orange-50/30 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm active:border-orange-400'
                                        }`}
                                        aria-pressed={isActive}
                                      >
                                        <span
                                          className={`text-base font-black sm:text-lg ${
                                            isActive
                                              ? 'text-orange-600'
                                              : 'text-gray-400'
                                          }`}
                                        >
                                          {sizeLabel}
                                        </span>

                                        <span
                                          className={`text-[10px] font-bold sm:text-xs ${
                                            isActive
                                              ? 'text-gray-900'
                                              : 'text-gray-500'
                                          }`}
                                        >
                                          {formatPrice(variant.price)}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          {/* Quantity + Price Section - Full Width */}
                          <div className="flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <button
                                onClick={() =>
                                  updateQuantity(item.uid, item.quantity - 1)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-gray-200 transition-colors hover:border-orange-500 hover:bg-orange-50 active:bg-orange-100 sm:h-10 sm:w-10"
                                aria-label="Réduire la quantité"
                              >
                                <Minus className="sm:h-4.5 sm:w-4.5 h-4 w-4" />
                              </button>
                              <span className="w-10 text-center text-base font-bold text-gray-900 sm:w-12 sm:text-lg">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.uid, item.quantity + 1)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-gray-200 transition-colors hover:border-orange-500 hover:bg-orange-50 active:bg-orange-100 sm:h-10 sm:w-10"
                                aria-label="Augmenter la quantité"
                              >
                                <Plus className="sm:h-4.5 sm:w-4.5 h-4 w-4" />
                              </button>
                            </div>

                            <p className="text-lg font-bold text-orange-600 sm:text-xl">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Bundle Promotion Suggestions - Inside scrollable area */}
                  {selectedBundleIds.size > 0 && missingBundles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50 p-3 text-xs text-orange-700 shadow-sm sm:rounded-2xl sm:p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold text-orange-800">
                          Boostez vos économies
                        </span>
                        <Badge className="bg-orange-600 text-xs font-bold text-white">
                          {bundleDiscountLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-orange-700/90">
                        {selectedBundleIds.size === 1
                          ? 'Ajoutez un autre menu Bundle pour bénéficier instantanément de -5% sur vos formules.'
                          : 'Complétez la trilogie de menus pour déclencher une remise supplémentaire de 8%.'}
                      </p>

                      <div className="mt-3 space-y-2">
                        {missingBundles.map(bundle => (
                          <div
                            key={bundle.id}
                            className="flex flex-col gap-2 rounded-xl bg-white/80 px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {bundle.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatPrice(bundle.price)} • Économisez{' '}
                                {formatPrice(bundle.savings)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-orange-200 text-orange-600 hover:bg-orange-100 sm:w-auto"
                              onClick={() => handleAddBundle(bundle.id)}
                            >
                              Ajouter
                            </Button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Totals */}
            {items.length > 0 && (
              <div className="flex-shrink-0 space-y-3 border-t border-gray-100 bg-gray-50 px-3 py-4 sm:space-y-4 sm:px-4 sm:py-5">
                <div className="space-y-1.5 text-xs text-gray-600 sm:space-y-2 sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span>Sous-total</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Livraison</span>
                    <span className="font-semibold text-gray-900">
                      {deliveryFee === 0 ? 'Offerte' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>TVA (18%)</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(tax)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-gray-900 shadow-sm sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Link href="/checkout" onClick={closeCart}>
                  <Button className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-red-700 hover:to-orange-700 active:scale-95 sm:py-4 sm:text-base">
                    Commander - {formatPrice(total)}
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
