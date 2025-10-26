'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue } from 'framer-motion';
import { ArrowRight, ChefHat, Sparkles, Tag, Star, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { MEAL_BUNDLES } from '@/data/mealBundles';
import type { MealBundle, MealBundleId } from '@/data/mealBundles';
import { cn, formatPrice } from '@/lib/utils';

const CAROUSEL_ORDER: MealBundleId[] = ['duo', 'solo', 'famille'];
const CHEF_STOCK_PRESET: Record<MealBundleId, number> = {
  solo: 18,
  duo: 12,
  famille: 8,
};

export default function MealBundles() {
  const { addItem } = useCart();
  const [centerIndex, setCenterIndex] = useState(1); // Solo au centre
  const [expandedId, setExpandedId] = useState<MealBundleId | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [previewBundle, setPreviewBundle] = useState<MealBundle | null>(null);
  const dragX = useMotionValue(0);

  // Detect mobile/desktop for responsive carousel spacing
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getOrderedBundles = () => {
    const rotated = [...CAROUSEL_ORDER];
    const rotation = centerIndex;
    for (let i = 0; i < rotation; i++) {
      rotated.unshift(rotated.pop()!);
    }
    return rotated.map(id => MEAL_BUNDLES.find(b => b.id === id)!);
  };

  const orderedBundles = getOrderedBundles();
  const activeBundle = orderedBundles[1];

  const handleNext = () => {
    setCenterIndex((prev) => (prev - 1 + CAROUSEL_ORDER.length) % CAROUSEL_ORDER.length);
    setExpandedId(null);
  };

  const handlePrev = () => {
    setCenterIndex((prev) => (prev + 1) % CAROUSEL_ORDER.length);
    setExpandedId(null);
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 30;
    const velocityThreshold = 500;

    // Swipe vers la droite (montre carte de gauche)
    if (info.offset.x > swipeThreshold || (info.velocity.x > velocityThreshold)) {
      handlePrev();
    }
    // Swipe vers la gauche (montre carte de droite)
    else if (info.offset.x < -swipeThreshold || (info.velocity.x < -velocityThreshold)) {
      handleNext();
    }
  };

  const handleCardClick = (bundleId: MealBundleId, isCenterCard: boolean) => {
    if (isCenterCard) {
      setExpandedId(expandedId === bundleId ? null : bundleId);
    }
  };

  const handleOrder = (bundle: MealBundle) => {
    addItem(
      {
        productId: `bundle-${bundle.id}`,
        name: bundle.name,
        description: bundle.subtitle,
        price: bundle.price,
        quantity: 1,
        extras: bundle.items.map(item => item.text),
        metadata: {
          bundle: bundle.id,
          savings: bundle.savings,
        },
      },
      { openCart: true }
    );
    setPreviewBundle(null);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-orange-50/30 py-16 text-slate-900 sm:py-20 lg:py-28">
      {/* Background accent blobs */}
      <div className="pointer-events-none absolute -left-20 top-20 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-red-400/10 blur-3xl" />

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full bg-orange-400/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 2}px`,
            height: `${Math.random() * 3 + 2}px`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-12 text-center sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Badge className="mx-auto mb-6 flex w-fit items-center gap-2.5 border border-orange-200 bg-gradient-to-r from-orange-100 via-red-100 to-orange-100 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-red-600">
            <Tag className="h-4 w-4" />
            Menus signature
          </Badge>

          <h2 className="relative mb-6 bg-gradient-to-br from-slate-900 via-red-700 to-orange-600 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            Un trio pour chaque appétit
            <motion.span
              className="absolute -right-6 -top-3 text-3xl sm:-right-10 sm:-top-5 sm:text-5xl"
              animate={{ rotate: [0, 14, -14, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ✨
            </motion.span>
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:hidden">
            Faites glisser pour découvrir nos menus. Touchez une carte pour voir les détails.
          </p>
          <p className="mx-auto hidden max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:block">
            Trois formules pensées pour chaque moment. Cliquez pour voir les détails complets.
          </p>
        </motion.div>

        {/* Mobile: 3D Carousel - Responsive container with overflow handling */}
        <div className="relative mb-12 overflow-visible md:hidden">
          <motion.div
            className="relative mx-auto cursor-grab touch-pan-y active:cursor-grabbing"
            style={{
              perspective: '2000px',
              perspectiveOrigin: 'center center',
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            dragMomentum={true}
            onDragEnd={handleDragEnd}
          >
            {/* Container with dynamic height for expanded cards */}
            <div className="relative mx-auto flex w-full max-w-6xl items-start justify-center overflow-visible px-2 py-8 sm:px-8" style={{ minHeight: expandedId ? '900px' : '550px', transition: 'min-height 0.3s ease-out' }}>
              <AnimatePresence mode="popLayout">
                {orderedBundles.map((bundle, index) => {
                  const Icon = bundle.icon;
                  const position = index - 1; // -1 (gauche), 0 (centre), 1 (droite)
                  const isCenterCard = position === 0;
                  const isExpanded = expandedId === bundle.id && isCenterCard;

                  return (
                    <motion.div
                      key={bundle.id}
                      layout
                      className={cn(
                        "absolute top-0 cursor-pointer select-none",
                        isCenterCard ? "z-30" : "z-10",
                        !isCenterCard && "pointer-events-none"
                      )}
                      initial={{
                        x: position * (isMobile ? 220 : 280),
                        scale: isCenterCard ? 1 : (isMobile ? 0.7 : 0.75),
                        rotateY: position * (isMobile ? -20 : -25),
                        opacity: isCenterCard ? 1 : 0.5,
                        z: position === 0 ? 0 : (isMobile ? -150 : -200),
                      }}
                      animate={{
                        x: position * (isMobile ? 220 : 280),
                        scale: isCenterCard ? 1 : (isMobile ? 0.7 : 0.75),
                        rotateY: position * (isMobile ? -50 : -25),
                        opacity: isCenterCard ? 1 : 0.5,
                        z: position === 0 ? 0 : (isMobile ? -100 : -200),
                        filter: isCenterCard ? 'brightness(1) saturate(1.1)' : 'brightness(0.6) saturate(0.6)',
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.5,
                      }}
                      transition={{
                        duration: 0.35,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        layout: { duration: 0.25 }
                      }}
                      onClick={() => handleCardClick(bundle.id, isCenterCard)}
                      whileHover={isCenterCard ? { scale: 1.02 } : {}}
                      whileTap={isCenterCard ? { scale: 0.98 } : {}}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <motion.div
                        layout
                        className={cn(
                          "relative w-[280px] overflow-visible rounded-[32px] border transition-all duration-500 sm:w-[340px] md:max-w-[360px]",
                          isCenterCard
                            ? 'border-orange-300 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 shadow-[0_20px_80px_-20px_rgba(249,115,22,0.4)]'
                            : 'border-slate-200 bg-white/80'
                        )}
                      >
                        {/* Center glow - Enhanced */}
                        {isCenterCard && (
                          <>
                            <motion.div
                              className="pointer-events-none absolute -inset-12 -z-10 rounded-[48px] bg-gradient-to-br from-orange-500/30 via-red-500/20 to-orange-500/30 blur-3xl"
                              animate={{
                                opacity: [0.3, 0.7, 0.3],
                                scale: [0.95, 1.1, 0.95],
                                rotate: [0, 180, 360]
                              }}
                              transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            <motion.div
                              className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-orange-400/25 via-red-400/15 to-orange-400/25 blur-xl"
                              animate={{
                                opacity: [0.5, 0.8, 0.5],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                              }}
                            />
                          </>
                        )}

                        <div className="relative p-6 sm:p-7">
                          {/* Header */}
                          <div className="mb-5 flex items-start justify-between gap-4">
                            <Badge
                              className={cn(
                                'rounded-full border-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white shadow-md',
                                bundle.badgeColor
                              )}
                            >
                              {bundle.badge}
                            </Badge>
                            <motion.div
                              className={cn(
                                "flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg",
                                isCenterCard
                                  ? "border-orange-300 bg-gradient-to-br from-orange-100 to-red-100 text-orange-600"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                              )}
                              animate={isCenterCard ? { rotate: [0, 5, -5, 0] } : {}}
                              transition={{ duration: 4, repeat: Infinity }}
                            >
                              <Icon className="h-7 w-7" />
                            </motion.div>
                          </div>

                          {/* Content */}
                          <div className="mb-5 space-y-2">
                            <p className={cn(
                              "text-xs font-bold uppercase tracking-[0.3em]",
                              isCenterCard ? "text-orange-600" : "text-slate-400"
                            )}>
                              {bundle.vibe}
                            </p>
                            <h3 className={cn(
                              "text-3xl font-black leading-tight",
                              isCenterCard ? "text-slate-900" : "text-slate-600"
                            )}>
                              {bundle.name}
                            </h3>
                            <p className={cn(
                              "text-sm leading-relaxed",
                              isCenterCard ? "text-slate-700" : "text-slate-500"
                            )}>
                              {bundle.subtitle}
                            </p>
                          </div>

                          {/* Quick items */}
                          <div className="mb-5 flex flex-wrap gap-2">
                            {bundle.items.slice(0, 3).map((item) => (
                              <span
                                key={item.text}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
                                  isCenterCard
                                    ? "border-orange-200 bg-orange-50/50 text-slate-700"
                                    : "border-slate-200 bg-slate-50 text-slate-500"
                                )}
                              >
                                <item.icon className="h-3.5 w-3.5" />
                                <span>{item.text.split(' ')[0]}</span>
                              </span>
                            ))}
                          </div>

                          {/* Price - Responsive layout */}
                          <div className={cn(
                            "mb-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-end sm:justify-between",
                            isCenterCard
                              ? "border-orange-200 bg-orange-50/30"
                              : "border-slate-200 bg-slate-50"
                          )}>
                            <div className="flex-1">
                              <p className={cn(
                                "text-[10px] font-bold uppercase tracking-[0.25em]",
                                isCenterCard ? "text-orange-600/80" : "text-slate-400"
                              )}>
                                Prix
                              </p>
                              <p className={cn(
                                "mt-1 break-words text-2xl font-black sm:text-3xl",
                                isCenterCard ? "text-slate-900" : "text-slate-600"
                              )}>
                                {formatPrice(bundle.price)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                              <p className={cn(
                                "text-xs line-through",
                                isCenterCard ? "text-slate-500" : "text-slate-400"
                              )}>
                                {formatPrice(bundle.originalPrice)}
                              </p>
                              <p className={cn(
                                "flex items-center gap-1 text-sm font-bold",
                                isCenterCard ? "text-orange-600" : "text-slate-500"
                              )}>
                                <Star className="h-3.5 w-3.5 fill-current" />
                                -{formatPrice(bundle.savings)}
                              </p>
                            </div>
                          </div>

                          {/* Expanded details - responsive and scrollable */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="overflow-hidden"
                              >
                                <div className="max-h-[500px] space-y-4 overflow-y-auto overscroll-contain px-1 scrollbar-thin scrollbar-track-orange-100 scrollbar-thumb-orange-300">
                                  <div className="h-px bg-slate-200" />

                                  {/* Tagline */}
                                  <p className="text-sm leading-relaxed text-slate-700">
                                    {bundle.tagline}
                                  </p>

                                  {/* Highlights */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                                      Points forts
                                    </p>
                                    {bundle.highlights.map((highlight, idx) => (
                                      <motion.div
                                        key={highlight}
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="flex items-start gap-2.5 rounded-lg border border-orange-200 bg-orange-50/50 px-3 py-2"
                                      >
                                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                        <span className="flex-1 text-xs leading-relaxed text-slate-700">{highlight}</span>
                                      </motion.div>
                                    ))}
                                  </div>

                                  {/* Items list */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                                      Inclus dans le menu
                                    </p>
                                    {bundle.items.map((item, idx) => (
                                      <motion.div
                                        key={item.text}
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.06 }}
                                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white/50 px-3 py-2"
                                      >
                                        <span className={cn(
                                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                          item.highlight
                                            ? "bg-gradient-to-br from-orange-100 to-red-100 text-orange-600"
                                            : "bg-slate-100 text-slate-500"
                                        )}>
                                          <item.icon className="h-4 w-4" />
                                        </span>
                                        <span className="flex-1 break-words text-sm text-slate-700">{item.text}</span>
                                      </motion.div>
                                    ))}
                                  </div>

                                  {/* CTA */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="sticky bottom-0 bg-gradient-to-t from-orange-50 via-orange-50 to-transparent pb-2 pt-4"
                                  >
                                    <Button
                                      size="lg"
                                      onClick={() => handleOrder(bundle)}
                                      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-red-600 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                                    >
                                      <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                      <span className="relative flex items-center justify-center gap-2">
                                        {bundle.ctaLabel}
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                      </span>
                                    </Button>
                                  </motion.div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Hint to expand (only center, not expanded) */}
                          {isCenterCard && !isExpanded && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="rounded-lg border border-orange-300 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2.5 text-center text-xs font-bold text-orange-700"
                            >
                              👆 Touchez pour voir les détails
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Indicators */}
          <div className="mt-8 flex justify-center gap-2">
            {CAROUSEL_ORDER.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === centerIndex
                    ? "w-8 bg-gradient-to-r from-red-500 to-orange-500"
                    : "w-2 bg-slate-300"
                )}
              />
            ))}
          </div>

          {/* Swipe hint */}
          <motion.p
            className="mt-4 text-center text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            👆 Glissez pour explorer · Touchez pour les détails
          </motion.p>
        </div>

        {/* Desktop: Static Grid Layout */}
        <div className="hidden md:block">
          <div className="grid gap-8 lg:grid-cols-3">
            {MEAL_BUNDLES.map((bundle, index) => {
              const Icon = bundle.icon;
              const isExpanded = expandedId === bundle.id;

              return (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.2,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="group"
                >
                  <motion.div
                    layout
                    className="relative h-full overflow-hidden rounded-3xl border-2 border-orange-200/60 bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 shadow-xl transition-all hover:border-orange-400 hover:shadow-2xl"
                    whileHover={{ y: -12, scale: 1.03 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                  >
                    {/* Multi-layer animated glow */}
                    <motion.div
                      className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-orange-500/30 via-red-500/20 to-orange-500/30 opacity-0 blur-3xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{
                        opacity: [0, 1, 0.8],
                        scale: [0.8, 1.2, 1.15],
                        transition: {
                          duration: 0.6,
                          times: [0, 0.5, 1]
                        }
                      }}
                    />
                    <motion.div
                      className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-orange-400/20 via-red-400/30 to-orange-400/20 opacity-0 blur-xl"
                      initial={{ opacity: 0 }}
                      whileHover={{
                        opacity: 1,
                        transition: { duration: 0.3, delay: 0.1 }
                      }}
                    />

                    <div className="relative p-6">
                      {/* Header */}
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: index * 0.2 + 0.4,
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                          }}
                          whileHover={{
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            transition: {
                              rotate: {
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 1
                              }
                            }
                          }}
                        >
                          <Badge
                            className={cn(
                              'rounded-full border-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white shadow-lg',
                              bundle.badgeColor
                            )}
                          >
                            {bundle.badge}
                          </Badge>
                        </motion.div>
                        <motion.div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 shadow-lg"
                          initial={{ scale: 0, rotate: 180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: index * 0.2 + 0.5,
                            type: "spring",
                            stiffness: 180,
                            damping: 12
                          }}
                          whileHover={{
                            rotate: 360,
                            scale: 1.15,
                            transition: { duration: 0.6, ease: "easeInOut" }
                          }}
                        >
                          <Icon className="h-7 w-7" />
                        </motion.div>
                      </div>

                      {/* Content */}
                      <motion.div
                        className="mb-5 space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.2 + 0.6,
                          duration: 0.5
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-600">
                          {bundle.vibe}
                        </p>
                        <motion.h3
                          className="text-3xl font-black leading-tight text-slate-900"
                          whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        >
                          {bundle.name}
                        </motion.h3>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {bundle.subtitle}
                        </p>
                      </motion.div>

                      {/* Quick items */}
                      <div className="mb-5 flex flex-wrap gap-2">
                        {bundle.items.slice(0, 3).map((item, itemIndex) => (
                          <motion.span
                            key={item.text}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: index * 0.2 + 0.7 + itemIndex * 0.1,
                              type: "spring",
                              stiffness: 150
                            }}
                            whileHover={{
                              scale: 1.1,
                              y: -3,
                              transition: { duration: 0.2 }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/50 px-2.5 py-1.5 text-xs text-slate-700 shadow-sm"
                          >
                            <item.icon className="h-3.5 w-3.5" />
                            <span>{item.text.split(' ')[0]}</span>
                          </motion.span>
                        ))}
                      </div>

                      {/* Price */}
                      <div className="mb-5 flex items-end justify-between rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50/50 to-red-50/30 p-4">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-600/80">
                            Prix
                          </p>
                          <p className="mt-1 text-3xl font-black text-slate-900">
                            {formatPrice(bundle.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-xs text-slate-500 line-through">
                            {formatPrice(bundle.originalPrice)}
                          </p>
                          <p className="flex items-center gap-1 text-sm font-bold text-orange-600">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            -{formatPrice(bundle.savings)}
                          </p>
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="max-h-[400px] space-y-4 overflow-y-auto overscroll-contain px-1 scrollbar-thin scrollbar-track-orange-100 scrollbar-thumb-orange-300">
                              <div className="h-px bg-slate-200" />

                              {/* Tagline */}
                              <p className="text-sm leading-relaxed text-slate-700">
                                {bundle.tagline}
                              </p>

                              {/* Highlights */}
                              <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                                  Points forts
                                </p>
                                {bundle.highlights.map((highlight, idx) => (
                                  <motion.div
                                    key={highlight}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="flex items-start gap-2.5 rounded-lg border border-orange-200 bg-orange-50/50 px-3 py-2"
                                  >
                                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                    <span className="flex-1 text-xs leading-relaxed text-slate-700">
                                      {highlight}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>

                              {/* Items list */}
                              <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                                  Inclus dans le menu
                                </p>
                                {bundle.items.map((item, idx) => (
                                  <motion.div
                                    key={item.text}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.06 }}
                                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white/50 px-3 py-2"
                                  >
                                    <span
                                      className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                        item.highlight
                                          ? 'bg-gradient-to-br from-orange-100 to-red-100 text-orange-600'
                                          : 'bg-slate-100 text-slate-500'
                                      )}
                                    >
                                      <item.icon className="h-4 w-4" />
                                    </span>
                                    <span className="flex-1 text-sm text-slate-700">
                                      {item.text}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Toggle/CTA Button */}
                      <motion.div
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPreviewBundle(bundle);
                          }}
                          className="mt-4 w-full border-dashed border-orange-200/70 bg-white/70 text-sm font-semibold text-orange-600 shadow-md transition hover:border-orange-400 hover:bg-white hover:shadow-lg"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 2
                              }}
                            >
                              <Sparkles className="h-4 w-4 text-orange-500" />
                            </motion.div>
                            Focus chef
                          </span>
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Button
                          size="lg"
                          onClick={() => {
                            if (isExpanded) {
                              handleOrder(bundle);
                            } else {
                              setExpandedId(bundle.id);
                            }
                          }}
                          className="group relative mt-3 w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-[length:200%_100%] px-6 py-3.5 text-base font-bold text-white shadow-xl transition-all hover:bg-[position:100%_0] hover:shadow-2xl"
                        >
                          <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                          />
                          <span className="relative flex items-center justify-center gap-2">
                            {isExpanded ? bundle.ctaLabel : 'Voir les détails'}
                            <motion.div
                              whileHover={{
                                x: [0, 5, 0],
                                transition: {
                                  duration: 0.6,
                                  repeat: Infinity
                                }
                              }}
                            >
                              <ArrowRight className="h-5 w-5" />
                            </motion.div>
                          </span>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <ChefPreviewOverlay
        bundle={previewBundle}
        onClose={() => setPreviewBundle(null)}
        onOrder={handleOrder}
      />
    </section>
  );
}

type ChefPreviewOverlayProps = {
  bundle: MealBundle | null;
  onClose: () => void;
  onOrder: (bundle: MealBundle) => void;
};

const ChefPreviewOverlay = ({ bundle, onClose, onOrder }: ChefPreviewOverlayProps) => {
  const baseStock = bundle ? CHEF_STOCK_PRESET[bundle.id] ?? 8 : 1;
  const [portionsLeft, setPortionsLeft] = useState(() =>
    bundle ? Math.max(1, baseStock - 2) : 0
  );

  useEffect(() => {
    if (!bundle) {
      return;
    }
    setPortionsLeft(Math.max(1, baseStock - Math.floor(Math.random() * 3) - 1));
  }, [bundle, baseStock]);

  useEffect(() => {
    if (!bundle) {
      return;
    }
    const interval = setInterval(() => {
      setPortionsLeft((prev) => Math.max(1, prev - 1));
    }, 15000);
    return () => clearInterval(interval);
  }, [bundle]);

  const stockPercent = bundle ? Math.max(8, Math.round((portionsLeft / baseStock) * 100)) : 0;

  return (
    <AnimatePresence>
      {bundle && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-md md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            key={bundle.id}
            layout
            initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 60, scale: 0.95, rotateX: -10 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.3 }
            }}
            className={cn(
              'relative w-full max-w-3xl rounded-[32px] border border-white/10 bg-gradient-to-br p-6 text-white shadow-2xl sm:p-8',
              bundle.color
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <motion.button
              type="button"
              aria-label="Fermer l'aperçu chef"
              className="absolute right-6 top-6 rounded-full border border-white/40 bg-white/10 p-2 text-white transition hover:bg-white/20"
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-4 w-4" />
            </motion.button>

            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-1 space-y-5">
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: [0, -15, 15, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    <ChefHat className="h-4 w-4 text-white" />
                  </motion.div>
                  Focus chef
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm font-semibold text-white/80">{bundle.vibe}</p>
                  <h3 className="text-3xl font-black leading-tight">{bundle.name}</h3>
                  <p className="text-base text-white/80">{bundle.tagline}</p>
                </motion.div>

                <div className="space-y-3 rounded-2xl bg-white/10 p-4 shadow-inner shadow-black/10">
                  <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                    <span>Prêt ce soir</span>
                    <span>{portionsLeft} menus restants</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-white shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${stockPercent}%` }}
                      transition={{
                        duration: 1.5,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.5
                      }}
                    />
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/50 to-transparent"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 1
                      }}
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/80">
                    Préparé en petites séries. Réservez votre menu avant rupture de stock.
                  </p>
                </div>

                <div className="space-y-3">
                  {bundle.highlights.slice(0, 3).map((highlight, index) => (
                    <motion.div
                      key={highlight}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.08 }}
                      className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 text-sm leading-relaxed"
                    >
                      <Sparkles className="mt-0.5 h-4 w-4 text-amber-200" />
                      <span>{highlight}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-5 rounded-[28px] bg-white/15 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                  Composition
                </p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {bundle.items.map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className={cn(
                        'min-w-[140px] rounded-2xl border border-white/20 p-4 text-sm',
                        item.highlight ? 'bg-white/20' : 'bg-white/10'
                      )}
                    >
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="font-semibold">{item.text}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button
                      className="w-full bg-white/90 text-slate-900 shadow-lg hover:bg-white hover:shadow-xl"
                      onClick={() => onOrder(bundle)}
                    >
                      Commander ce bundle
                    </Button>
                  </motion.div>
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-white/40 text-white hover:bg-white/10"
                      onClick={onClose}
                    >
                      Fermer
                    </Button>
                  </motion.div>
                </div>
                <p className="text-center text-xs text-white/70">
                  Livraison prioritaire incluse · {formatPrice(bundle.savings)} économisés
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};







