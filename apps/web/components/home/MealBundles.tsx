'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { MEAL_BUNDLES } from '@/data/mealBundles';
import type { MealBundle } from '@/data/mealBundles';
import { cn, formatPrice } from '@/lib/utils';

const cardVariants = {
  idle: { scale: 0.95, opacity: 0.7 },
  active: { scale: 1, opacity: 1 },
};

const glowVariants = {
  idle: { opacity: 0 },
  active: { opacity: 0.5 },
};

export default function MealBundles() {
  const { addItem } = useCart();
  const [activeId, setActiveId] = useState<MealBundle['id']>('solo');

  const activeBundle = useMemo(
    () => MEAL_BUNDLES.find(bundle => bundle.id === activeId) ?? MEAL_BUNDLES[0],
    [activeId]
  );

  const handleSelect = (id: MealBundle['id']) => setActiveId(id);

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
  };

  return (
    <section className="relative overflow-hidden bg-[#060712] py-20 text-white sm:py-24 lg:py-28">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-500/25 blur-[180px]"
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-red-500/20 blur-[160px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-white/10 text-[11px] font-semibold uppercase tracking-[0.32em] text-white">
            <Tag className="h-4 w-4 text-orange-300" />
            Menus signature
          </Badge>
          <motion.h2
            className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            Un trio pour chaque appétit
          </motion.h2>
            <motion.p
              className="mx-auto mt-4 max-w-2xl text-sm text-white/75 sm:text-base"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.08, duration: 0.55, ease: 'easeOut' }}
            >
              Feuilletez le catalogue : chaque menu a son tempérament. Sélectionnez une carte pour afficher ses détails, commandez en un clic.
            </motion.p>
        </div>

        <div className="mt-14 flex flex-col gap-10">
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 md:mx-0 md:flex-wrap md:justify-between md:gap-6 md:overflow-visible md:pb-0">
            {MEAL_BUNDLES.map(bundle => {
              const Icon = bundle.icon;
              const isActive = bundle.id === activeBundle.id;
              return (
                <motion.button
                  key={bundle.id}
                  type="button"
                  className={cn(
                    'group relative min-w-[250px] snap-center overflow-hidden rounded-[28px] border border-orange-200/20 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-red-500/20 px-5 py-6 text-left text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 md:min-w-[280px] md:flex-1'
                  )}
                  variants={cardVariants}
                  animate={isActive ? 'active' : 'idle'}
                  whileHover="active"
                  onClick={() => handleSelect(bundle.id)}
                >
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -inset-16 rounded-[36px] bg-gradient-to-br from-orange-400/30 via-orange-500/15 to-red-500/25 blur-3xl"
                    variants={glowVariants}
                  />
                  <div className="relative flex flex-col gap-5">
                    <div className="flex items-center justify-between gap-3">
                      <Badge
                        className={cn(
                          'rounded-full border-0 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white',
                          bundle.badgeColor
                        )}
                      >
                        {bundle.badge}
                      </Badge>
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase tracking-[0.32em] text-orange-100/70">
                        {bundle.vibe}
                      </p>
                      <h3 className="text-lg font-semibold">{bundle.name}</h3>
                      <p className="text-sm text-orange-100/80">{bundle.subtitle}</p>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-orange-100/70">
                          Menu
                        </p>
                        <p className="text-2xl font-black text-white">
                          {formatPrice(bundle.price)}
                        </p>
                      </div>
                      <div className="text-right text-xs text-orange-100/70">
                        <p>{formatPrice(bundle.originalPrice)}</p>
                        <p className="font-semibold text-orange-100">
                          -{formatPrice(bundle.savings)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-orange-100/80">
                      {bundle.items.slice(0, 2).map(item => (
                        <span
                          key={item.text}
                          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.text}
                        </span>
                      ))}
                      {bundle.items.length > 2 && (
                        <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">
                          +{bundle.items.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeBundle.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="relative rounded-[32px] border border-orange-200/20 bg-white/[0.06] p-6 shadow-[0_30px_120px_-55px_rgba(248,113,113,0.75)] backdrop-blur-xl sm:p-8"
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -inset-16 rounded-[40px] bg-gradient-to-br from-orange-400/25 via-orange-500/15 to-red-500/20 opacity-60 blur-3xl"
                animate={{ rotate: [0, 10, -8, 0] }}
                transition={{ duration: 16, repeat: Infinity }}
              />
              <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)] lg:items-start">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-2xl font-semibold sm:text-3xl">
                      {activeBundle.name}
                    </h3>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                        Prix
                      </p>
                      <p className="text-3xl font-black text-white">
                        {formatPrice(activeBundle.price)}
                      </p>
                      <p className="text-xs text-orange-200">
                        {formatPrice(activeBundle.originalPrice)} · économie{' '}
                        {formatPrice(activeBundle.savings)}
                      </p>
                    </div>
                  </div>
                  <p className="text-base text-white/75 sm:text-lg">
                    {activeBundle.tagline}
                  </p>
                  <p className="text-sm text-white/70 sm:text-base">
                    {activeBundle.description}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeBundle.highlights.slice(0, 3).map(highlight => (
                      <div
                        key={highlight}
                        className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm text-white/85"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/70 to-red-500/60 text-white">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 rounded-3xl border border-white/12 bg-white/8 p-5 text-sm text-white/80">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    Inclus
                  </p>
                  <div className="space-y-3">
                    {activeBundle.items.map(item => (
                      <div
                        key={item.text}
                        className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-2.5"
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-xl border border-white/15',
                            item.highlight
                              ? 'bg-orange-500/30 text-white'
                              : 'bg-white/12 text-white/65'
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm text-white/80">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 rounded-2xl border border-white/12 bg-gradient-to-br from-orange-500/20 to-red-500/20 px-5 py-4 text-sm text-white/85">
                    <p className="font-semibold text-white">
                      {activeBundle.ctaSubLabel}
                    </p>
                    <Button
                      size="lg"
                      className="rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 px-6 py-3 text-base font-semibold text-white shadow-[0_22px_80px_-40px_rgba(248,113,113,0.9)] hover:shadow-[0_22px_80px_-30px_rgba(248,113,113,0.95)]"
                      onClick={() => handleOrder(activeBundle)}
                    >
                      <span className="flex items-center justify-center gap-3">
                        {activeBundle.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

