'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, MapPin, Sparkles, Star, Truck } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&h=900&fit=crop';

const MOBILE_PROMOS = [
  {
    id: 'launch',
    image:
      'https://images.unsplash.com/photo-1623398969394-2c02e167498e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735',
    badge: 'Offre lancement',
    eyebrow: 'Première commande ?',
    title: '-20% sur votre panier',
    description: 'Code PIZZA20 valable cette semaine sur toutes nos recettes signature.',
    code: 'PIZZA20',
    cta: { label: "Voir l'offre", href: '/offres' },
  },
  {
    id: 'duo',
    image:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&h=1200&fit=crop&q=80',
    badge: 'Soirée duo',
    eyebrow: 'Tous les jeudis',
    title: '1 pizza achetée = 1 offerte',
    description: 'Ajoutez deux pizzas M au panier après 19h, la moins chère est offerte.',
    code: 'DUOJEUDI',
    cta: { label: 'Préparer ma soirée', href: '/menu' },
  },
  {
    id: 'family',
    image:
      'https://images.unsplash.com/photo-1600628421060-939639517883?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470',
    badge: 'Pack famille',
    eyebrow: 'Week-end',
    title: '-8 000 FCFA sur 4 parts',
    description: 'Deux grandes pizzas + boissons + desserts à prix réduit le week-end.',
    code: 'FAMILY8K',
    cta: { label: 'Découvrir le pack', href: '/menu' },
  },
  {
    id: 'lunch',
    image:
      'https://images.unsplash.com/photo-1748040581816-6b1864cdd686?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
    badge: 'Midi express',
    eyebrow: 'Service 11h-14h',
    title: 'Livraison garantie 20 min',
    description: "En cas de retard, votre dessert maison est offert automatiquement.",
    code: 'MIDI20',
    cta: { label: 'Commander pour midi', href: '/menu' },
  },
];

const stats = [
  { label: 'Recettes signées', value: '24' },
  { label: 'Clients livrés', value: '10k+' },
  { label: 'Note moyenne', value: '4.9⭐' },
  { label: 'Ingrédients frais', value: '100%' },
];

const highlights = [
  {
    icon: <Clock className="h-5 w-5 text-red-500" />,
    title: 'Livraison 30 min chrono',
    subtitle: "ou c'est offert",
  },
  {
    icon: <Truck className="h-5 w-5 text-orange-500" />,
    title: 'Suivi livraison en live',
    subtitle: 'Livreurs internes formés',
  },
  {
    icon: <MapPin className="h-5 w-5 text-emerald-500" />,
    title: 'Livré chez vous, au bureau, à l’école',
    subtitle: 'Nous couvrons tout Bangui',
  },
];

export default function HeroSection() {
  return (
    <section className="sm:py-18 relative overflow-hidden bg-gradient-to-br from-white via-red-50/40 to-orange-50/40 py-16 lg:py-24">
      <BackgroundAccent />

      <div className="container relative z-10">
        <div className="lg:hidden">
          <MobileLaunchOffer />
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14">
          <HeroContent />
          <DesktopVisual />
        </div>
      </div>
      <div className="mt-10 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 sm:mt-10">
        Service 11h - minuit • Support 7j/7
      </div>
    </section>
  );
}

const MobileLaunchOffer = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    MOBILE_PROMOS.forEach(promo => {
      const img = new window.Image();
      img.src = promo.image;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % MOBILE_PROMOS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activePromo = MOBILE_PROMOS[activeIndex];

  return (
    <div className="relative mb-10 min-h-[240px] w-full overflow-hidden lg:hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePromo.id}
          initial={{ x: 90, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -90, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 overflow-hidden rounded-3xl border border-red-100 bg-white/10 text-white shadow-[0_30px_90px_-55px_rgba(248,113,113,0.75)] backdrop-blur"
        >
          <div className="absolute inset-0">
            <Image
              src={activePromo.image}
              alt={activePromo.title}
              fill
              sizes="100vw"
              priority={activeIndex === 0}
              className="scale-[1.08] object-cover object-center brightness-[0.92] saturate-[1.1]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-red-700/60 to-orange-600/55" />

          <div className="relative z-10 flex min-h-[220px] flex-col justify-between gap-5 p-5">
            <div className="space-y-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]">
                <Sparkles className="h-3.5 w-3.5" />
                {activePromo.badge}
              </span>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-white/90">{activePromo.eyebrow}</p>
                <p className="text-2xl font-black leading-tight text-white">{activePromo.title}</p>
                <p className="text-xs text-white/80">{activePromo.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-600 shadow-lg shadow-red-900/25">
                Code:
                <span className="tracking-[0.35em] text-red-600">{activePromo.code}</span>
              </span>

              <Link
                href={activePromo.cta.href}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 underline decoration-white/40 underline-offset-4"
              >
                {activePromo.cta.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const HeroContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col gap-8 text-left"
    >
      <div className="space-y-5">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-600 sm:text-sm"
        >
          N°1 Pizza à Bangui 🇨🇫
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-[2.45rem] font-black leading-[1.05] text-slate-900 sm:text-[2.85rem] lg:text-[3.25rem]"
        >
          Pizza King, la chaleur Domino’s en 20 minutes.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl text-sm text-slate-600 sm:text-base"
        >
          Pâte reposée 48h, ingrédients locaux choisis et suivi GPS minute par minute. Même chaleur, même croustillant, livré là où vous êtes.
        </motion.p>
      </div>

      <StatsAndVisual />
      <Highlights />
      <HeroCta />
    </motion.div>
  );
};

const StatsAndVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur-lg sm:p-6"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grow grid-cols-2 gap-x-6 gap-y-4">
          {stats.map(stat => (
            <div key={stat.label} className="text-left">
              <p className="text-xl font-black text-slate-900 sm:text-2xl">
                {stat.value}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center sm:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 160 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-red-500/20 via-orange-400/20 to-red-500/20 blur-2xl" />
            <img
              src={HERO_IMAGE}
              alt="Pizza King mobile"
              className="relative w-40 rounded-2xl border border-white/40 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.65)] sm:w-48 lg:hidden"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const Highlights = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {highlights.map(highlight => (
        <div
          key={highlight.title}
          className="flex items-center gap-3 rounded-2xl border border-slate-100/70 bg-white px-4 py-4 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.6)] backdrop-blur"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100/80">
            {highlight.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {highlight.title}
            </p>
            <p className="text-xs text-slate-500">{highlight.subtitle}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const HeroCta = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4"
    >
      <Link href="/menu" className="group relative flex w-full sm:w-auto">
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-red-600 opacity-60 blur-lg transition group-hover:opacity-90"
        />
        <Button
          size="lg"
          className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-red-600 px-6 py-4 text-base font-black shadow-lg transition hover:shadow-xl sm:px-8"
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 block skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
            Commander maintenant
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </Link>
    </motion.div>
  );
};


const DesktopVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 35 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative hidden justify-end lg:flex"
    >
      <div className="relative w-full max-w-[420px]">
        <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-red-500/20 via-orange-500/15 to-red-500/20 blur-3xl" />
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[36px] border border-white/50 shadow-[0_38px_120px_-45px_rgba(15,23,42,0.55)]">
          <Image
            src={HERO_IMAGE}
            alt="Pizza King premium desktop"
            fill
            priority
            sizes="(min-width: 1024px) 420px, 90vw"
            className="object-cover object-center"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 150 }}
          className="absolute -left-6 top-10 w-48 rounded-3xl border border-red-100 bg-white/95 p-4 text-sm shadow-[0_25px_80px_-45px_rgba(248,113,113,0.55)] backdrop-blur"
        >
          <p className="text-xs font-semibold text-red-500">Offre lancement</p>
          <p className="mt-1 text-lg font-black text-slate-900">
            -20% 1ère commande
          </p>
          <p className="text-xs text-slate-500">Code: PIZZA20</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 150 }}
          className="absolute -right-6 bottom-10 flex w-48 flex-col gap-2 rounded-3xl border border-white/60 bg-white/95 p-4 text-sm shadow-[0_25px_80px_-45px_rgba(15,23,42,0.55)] backdrop-blur"
        >
          <div className="flex items-center gap-1.5 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="text-lg font-black text-slate-900">4.9/5.0</p>
          <p className="text-xs text-slate-500">Sur 10 000 avis certifiés</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const BackgroundAccent = () => (
  <>
    <div className="absolute -left-10 top-20 h-48 w-48 rounded-full bg-red-400/15 blur-3xl sm:h-64 sm:w-64" />
    <div className="absolute -right-12 bottom-24 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl sm:h-64 sm:w-64" />
  </>
);
