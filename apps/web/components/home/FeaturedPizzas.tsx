'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Flame,
  Heart,
  Leaf,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { getPizzaSizeVariants, resolvePizzaVariant } from '@/lib/pizzaPricing';
import { getFeaturedPizzas, type Pizza } from '@/lib/services/pizzas';

const mockPizzas: Pizza[] = [
  {
    id: '1',
    name: 'Margherita Classique',
    description:
      "Sauce tomate artisanale, mozzarella di bufala DOP, basilic frais, huile d'olive extra vierge",
    shortDesc: "L'authentique italienne",
    price: 5500,
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=800&fit=crop&q=80',
    rating: 4.9,
    reviews: 1245,
    tags: ['Classique', 'Top 3'],
    isSpicy: false,
    isVegetarian: true,
    isBestSeller: true,
    prepTime: '12-15 min',
    loves: 2341,
  },
  {
    id: '2',
    name: 'Pepperoni Suprême',
    description:
      'Triple pepperoni premium, mozzarella généreuse, sauce tomate maison, origan',
    shortDesc: 'La préférée des carnivores',
    price: 7500,
    image:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=800&fit=crop&q=80',
    rating: 4.9,
    reviews: 2198,
    tags: ['Best Seller', '#1'],
    isSpicy: false,
    isVegetarian: false,
    isBestSeller: true,
    prepTime: '15-18 min',
    loves: 3891,
  },
  {
    id: '3',
    name: 'Quatre Fromages',
    description:
      'Mozzarella, gorgonzola doux, parmesan reggiano, emmental, crème fraîche',
    shortDesc: 'Le paradis du fromage',
    price: 8500,
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop&q=80',
    rating: 4.8,
    reviews: 1567,
    tags: ['Fromage', 'Premium'],
    isSpicy: false,
    isVegetarian: true,
    isBestSeller: false,
    prepTime: '16-19 min',
    loves: 1876,
  },
  {
    id: '4',
    name: 'BBQ Chicken',
    description:
      'Poulet rôti mariné 24h, oignons rouges, bacon croustillant, sauce BBQ fumée, coriandre',
    shortDesc: 'Saveurs américaines',
    price: 9500,
    image:
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=800&fit=crop&q=80',
    rating: 4.9,
    reviews: 2876,
    tags: ['Signature', 'Top 3'],
    isSpicy: false,
    isVegetarian: false,
    isBestSeller: true,
    prepTime: '18-22 min',
    loves: 4123,
  },
  {
    id: '5',
    name: 'Végétarienne Deluxe',
    description:
      'Poivrons grillés, champignons frais, oignons, tomates cerises, olives, aubergines',
    shortDesc: 'Jardin de légumes frais',
    price: 7000,
    image:
      'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=800&fit=crop&q=80',
    rating: 4.7,
    reviews: 987,
    tags: ['Végé', 'Healthy'],
    isSpicy: false,
    isVegetarian: true,
    isBestSeller: false,
    prepTime: '15-18 min',
    loves: 1234,
  },
  {
    id: '6',
    name: 'Diavola Infernale',
    description:
      'Salami piquant, jalapeños, piments calabrais, huile pimentée, mozzarella fumée',
    shortDesc: 'Pour les aventuriers',
    price: 8000,
    image:
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=800&fit=crop&q=80',
    rating: 4.8,
    reviews: 1456,
    tags: ['Épicé', 'Intense'],
    isSpicy: true,
    isVegetarian: false,
    isBestSeller: false,
    prepTime: '16-19 min',
    loves: 2098,
  },
];

export default function FeaturedPizzas() {
  const { addItem, openCart } = useCart();
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPizzas = async () => {
      try {
        const fetched = await getFeaturedPizzas(6);
        if (isMounted && fetched.length > 0) {
          setPizzas(fetched);
        }
      } catch (error) {
        console.error('Failed to load featured pizzas:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchPizzas();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayedPizzas = useMemo(() => {
    if (pizzas.length === 0) {
      return mockPizzas;
    }

    return pizzas.slice(0, 6);
  }, [pizzas]);

  const aggregatedStats = useMemo(() => {
    if (displayedPizzas.length === 0) {
      return {
        avgRating: 0,
        totalOrders: 0,
        totalReviews: 0,
        highlightedPrep: '15-20 min',
      };
    }

    const totals = displayedPizzas.reduce(
      (acc, pizza) => {
        acc.rating += pizza.rating ?? 0;
        acc.orders += pizza.loves ?? 0;
        acc.reviews += pizza.reviews ?? 0;
        return acc;
      },
      { rating: 0, orders: 0, reviews: 0 }
    );

    const prepSample =
      displayedPizzas.find((pizza) => Boolean(pizza.prepTime))?.prepTime ??
      '15-20 min';

    return {
      avgRating: totals.rating / displayedPizzas.length,
      totalOrders: totals.orders,
      totalReviews: totals.reviews,
      highlightedPrep: prepSample,
    };
  }, [displayedPizzas]);

  const heroStats = [
    {
      label: 'Note moyenne',
      value:
        aggregatedStats.avgRating > 0
          ? `${aggregatedStats.avgRating.toFixed(1)}/5`
          : '4.9/5',
      hint:
        aggregatedStats.totalReviews > 0
          ? `${aggregatedStats.totalReviews.toLocaleString()} avis`
          : '1200 avis',
      icon: Star,
    },
    {
      label: 'Préparation',
      value: aggregatedStats.highlightedPrep,
      hint: 'en moyenne',
      icon: Clock,
    },
    {
      label: 'Commandes',
      value:
        aggregatedStats.totalOrders > 0
          ? `${aggregatedStats.totalOrders.toLocaleString()}`
          : '3800',
      hint: 'ce mois-ci',
      icon: ShoppingCart,
    },
  ];

  const heroChips = [
    'Pâte levée 48h',
    'Mozzarella fior di latte',
    'Cuisson pierre 400°C',
  ];

  const marqueeLabels = useMemo(() => {
    const featuredNames = displayedPizzas.map((pizza) => pizza.name);
    const extraHighlights = [
      '🔥 Livraison Express',
      '⭐ 4.9/5 Étoiles',
      '🍕 Pâte Levée 48h',
      '🧀 Mozzarella DOP',
      '🌿 Ingrédients Frais',
      '⚡ Cuisson Pierre 400°C',
      '💯 Satisfaction Garantie',
      '🚀 En 30min Chrono',
      '❤️ Fait Maison',
      '🎯 Menu Duo Mezzo',
      '👨‍🍳 Recettes Signature',
      '🌟 Best Sellers',
    ];

    return [...featuredNames, ...extraHighlights];
  }, [displayedPizzas]);

  const tickerItems = useMemo(() => {
    return [...marqueeLabels, ...marqueeLabels];
  }, [marqueeLabels]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      setActiveIndex(0);
      return;
    }

    const updateActiveIndex = () => {
      const items = Array.from(container.children) as HTMLElement[];
      if (items.length === 0) {
        setActiveIndex(0);
        return;
      }

      const { scrollLeft, offsetWidth } = container;
      const viewportCenter = scrollLeft + offsetWidth / 2;

      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(itemCenter - viewportCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveIndex(nearestIndex);
    };

    updateActiveIndex();

    const handleScroll = () => {
      window.requestAnimationFrame(updateActiveIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateActiveIndex();
      });
      resizeObserver.observe(container);
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver?.disconnect();
    };
  }, [displayedPizzas]);

  const scrollToSlide = (index: number) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const target = container.children[index] as HTMLElement | undefined;
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    setActiveIndex(index);
  };

  const renderMobileCard = (pizza: Pizza, index: number, wrapperClassName?: string) => (
    <motion.div
      key={pizza.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={['h-full', wrapperClassName ?? ''].filter(Boolean).join(' ')}
    >
      <Card className="group flex h-full flex-col overflow-hidden border border-orange-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
        <div className="relative h-48 w-full overflow-hidden bg-orange-50">
          <Image
            src={pizza.image}
            alt={pizza.name}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index < 3}
          />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {pizza.isBestSeller && (
              <Badge className="bg-orange-600/90 text-xs font-semibold text-white">
                Coup de cœur
              </Badge>
            )}
            {pizza.isVegetarian && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                <Leaf className="h-3.5 w-3.5" />
                Végé
              </Badge>
            )}
            {pizza.isSpicy && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-red-200 bg-red-50 text-red-600"
              >
                <Flame className="h-3.5 w-3.5" />
                Épicé
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-4 p-5">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {pizza.name}
              </h3>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                {formatPrice(pizza.price)}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-gray-600">
              {pizza.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-orange-500" />
              {pizza.rating.toFixed(1)} ({pizza.reviews} avis)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              {pizza.prepTime}
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <ShoppingCart className="h-3.5 w-3.5 text-orange-500" />
              {pizza.loves.toLocaleString()} commandes
            </span>
          </div>

          <div className="mt-auto flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={() => handleAddToCart(pizza, false)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Ajouter
            </Button>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              onClick={() => handleAddToCart(pizza, true)}
            >
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Commander
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );


type TiltedCardProps = {
  children: ReactNode;
};

const TiltedCard = ({ children }: TiltedCardProps) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glowX = useMotionValue('50%');
  const glowY = useMotionValue('50%');
  const springConfig = { stiffness: 110, damping: 18, mass: 0.4 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,0.35), transparent 60%)`;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const percentX = x / bounds.width - 0.5;
    const percentY = y / bounds.height - 0.5;
    const tiltRange = 9;

    rotateY.set(percentX * tiltRange);
    rotateX.set(-percentY * tiltRange);
    glowX.set(`${(percentX + 0.5) * 100}%`);
    glowY.set(`${(percentY + 0.5) * 100}%`);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glowX.set('50%');
    glowY.set('50%');
  };

  return (
    <motion.div
      className="group relative h-full rounded-[32px]"
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[32px] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background: glowBackground }}
      />
      <div className="h-full rounded-[32px] ring-1 ring-transparent transition duration-300 group-hover:ring-orange-200/50">
        {children}
      </div>
    </motion.div>
  );
};


  const handleAddToCart = (pizza: Pizza, shouldOpenCart: boolean) => {
    const variants = getPizzaSizeVariants(pizza.price);
    const defaultVariant = resolvePizzaVariant(variants);

    addItem(
      {
        productId: pizza.id,
        name: pizza.name,
        description: pizza.shortDesc ?? pizza.description,
        image: pizza.image,
        price: defaultVariant.price,
        sizeId: defaultVariant.id,
        sizeLabel: defaultVariant.label,
        priceVariants: variants,
        category: pizza.category ?? 'pizza',
        metadata: {
          prepTime: pizza.prepTime,
          rating: pizza.rating,
          Portions: defaultVariant.description,
        },
      },
      { openCart: shouldOpenCart }
    );

    if (shouldOpenCart) {
      openCart();
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fff4ec] via-white to-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-red-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8 md:space-y-16">
        <div className="md:hidden space-y-10">
          <div className="space-y-6">
            <Badge className="w-fit bg-gradient-to-r from-orange-600 to-red-500 text-white">
              Best sellers signature
            </Badge>
            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight text-gray-900">
                Les incontournables maison
              </h2>
              <p className="text-base text-gray-600">
                Recettes iconiques, ingrédients premium, cuissons minute.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-orange-600">
              <ShoppingCart className="h-5 w-5" />
              Livraison express chez vous
            </div>
            <Button
              asChild
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
            >
              <Link href="/menu">
                Découvrir tout le menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                <span className="bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 bg-clip-text text-transparent">
                  Pépites gourmandes
                </span>
              </h3>
              <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200/60 bg-gradient-to-r from-orange-50 via-white to-red-50 shadow-lg backdrop-blur">
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-red-400/10 to-orange-400/10"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                <motion.div
                  className="relative flex items-center gap-6 whitespace-nowrap px-6 py-3 text-xs font-bold uppercase tracking-wider text-orange-600"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
                >
                  {tickerItems.map((label, index) => (
                    <span key={`${label}-${index}`} className="flex items-center gap-4">
                      <span className="drop-shadow-sm">{label}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-sm" />
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>

            <div className="relative -mx-4 pb-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#fff4ec] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#fff4ec] to-transparent" />
              <div
                ref={scrollRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
              >
                {displayedPizzas.map((pizza, index) =>
                  renderMobileCard(pizza, index, 'w-[85%] flex-shrink-0 snap-center')
                )}
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {displayedPizzas.map((pizza, index) => (
                <button
                  key={pizza.id}
                  type="button"
                  aria-label={`Voir la pizza ${pizza.name}`}
                  onClick={() => scrollToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'w-6 bg-orange-500' : 'w-2 bg-orange-200'
                  }`}
                />
              ))}
            </div>

            {isLoading && (
              <p className="text-center text-sm text-gray-400">Chargement des recettes en cours...</p>
            )}
          </div>
        </div>

        <div className="hidden md:block">
          {/* Desktop ticker banner */}
          <div className="mb-8 overflow-hidden rounded-2xl border-2 border-orange-200/60 bg-gradient-to-r from-orange-50 via-white to-red-50 shadow-xl backdrop-blur">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-red-400/10 to-orange-400/10 opacity-50"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ backgroundSize: '200% 200%' }}
            />
            <motion.div
              className="relative flex items-center gap-8 whitespace-nowrap px-8 py-4 text-sm font-bold uppercase tracking-wider text-orange-600"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
            >
              {tickerItems.map((label, index) => (
                <span key={`desktop-${label}-${index}`} className="flex items-center gap-5">
                  <span className="drop-shadow-sm">{label}</span>
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-md" />
                </span>
              ))}
            </motion.div>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6">
              <Badge className="w-fit bg-white/80 text-xs font-semibold uppercase tracking-[0.3em] text-orange-600 shadow-sm shadow-orange-100 backdrop-blur">
                Nos pizzas
              </Badge>
              <div className="space-y-4">
                <h2 className="text-3xl font-black leading-tight text-gray-900 sm:text-4xl">
                  Les incontournables maison
                </h2>
                <p className="text-base text-gray-600 sm:text-lg">
                  Recettes iconiques, ingrédients premium, cuissons minute. Nos pizzas signature qui font notre réputation.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm shadow-orange-100 backdrop-blur"
                    >
                      <Icon className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500">{stat.hint}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                {heroChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-orange-200/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-600 shadow-sm shadow-orange-100"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <Button
                asChild
                variant="outline"
                className="w-fit border-orange-200 bg-white/80 text-orange-600 hover:border-orange-400 hover:bg-white"
              >
                <Link href="/menu" aria-label="Voir toute la carte">
                  Voir toute la carte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-gradient-to-br from-orange-500/10 via-orange-50 to-white/80 p-6 shadow-2xl shadow-orange-100 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-500">
                Livraison express
              </p>
              <p className="mt-4 text-2xl font-bold leading-snug text-gray-900">
                Vos pizzas chaudes livrées en moins de 30 minutes.
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Commandez maintenant et suivez votre livraison en temps réel. Gagnez des points fidélité à chaque commande.
              </p>
              <div className="mt-6 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-inner">
                <p className="text-sm font-semibold text-gray-900">Garantie fraîcheur</p>
                <p className="text-xs text-gray-500">
                  Pizzas préparées à la commande et livrées chaudes, ou remboursées.
                </p>
              </div>
              <Button
                className="mt-6 w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 transition hover:scale-[1.01] hover:from-orange-600 hover:to-red-600"
                onClick={() => {
                  const firstPizza = displayedPizzas[0];
                  if (firstPizza) {
                    handleAddToCart(firstPizza, true);
                  }
                }}
              >
                Commander maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {displayedPizzas.map((pizza, index) => (
              <motion.article
                key={pizza.id}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: (index % 2) * 0.08 }}
              >
                <TiltedCard>
                  <Card className="flex h-full flex-col overflow-hidden border-0 bg-white/85 shadow-2xl shadow-orange-100 ring-1 ring-orange-100/60 backdrop-blur">
                    <div className="relative h-64 w-full">
                      <Image
                        src={pizza.image}
                        alt={pizza.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        priority={index < 2}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {pizza.isBestSeller && (
                          <Badge className="flex items-center gap-1 bg-gradient-to-r from-orange-500/90 to-red-500/90 text-[11px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-orange-500/40">
                            <Star className="h-3 w-3 text-white" />
                            Populaire
                          </Badge>
                        )}
                        {pizza.isVegetarian && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-emerald-200/70 bg-white/20 text-[11px] font-semibold text-white backdrop-blur"
                          >
                            <Leaf className="h-3.5 w-3.5 text-emerald-200" />
                            Végé
                          </Badge>
                        )}
                        {pizza.isSpicy && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-red-200/70 bg-white/20 text-[11px] font-semibold text-white backdrop-blur"
                          >
                            <Flame className="h-3.5 w-3.5 text-red-200" />
                            Épicé
                          </Badge>
                        )}
                      </div>

                      <button
                        type="button"
                        aria-label={`Ajouter ${pizza.name} aux favoris`}
                        className="group absolute right-4 top-4 rounded-full bg-white/80 p-2 text-gray-700 shadow-md transition hover:bg-white"
                      >
                        <Heart className="h-4 w-4 transition group-hover:fill-rose-500 group-hover:text-rose-500" />
                      </button>

                      {pizza.shortDesc && (
                        <div className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
                          {pizza.shortDesc}
                        </div>
                      )}
                    </div>

                    <CardContent className="flex flex-1 flex-col gap-6 p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-orange-500">
                              Nos pizzas
                            </p>
                            <h3 className="text-2xl font-bold text-gray-900">
                              {pizza.name}
                            </h3>
                          </div>
                          {pizza.prepTime && (
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                              {pizza.prepTime}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600">
                          {pizza.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                          <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                          {pizza.rating.toFixed(1)}
                          <span className="text-gray-500">
                            ({(pizza.reviews ?? 0).toLocaleString()} avis)
                          </span>
                        </div>
                        {pizza.prepTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-orange-500" />
                            {pizza.prepTime}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <ShoppingCart className="h-4 w-4 text-orange-500" />
                          {(pizza.loves ?? 0).toLocaleString()} commandes
                        </div>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">
                            À partir de
                          </p>
                          <p className="text-3xl font-black text-gray-900">
                            {formatPrice(pizza.price)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            variant="outline"
                            className="border-orange-200 text-orange-600 hover:border-orange-400 hover:bg-orange-50"
                            onClick={() => handleAddToCart(pizza, false)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 px-5 py-2 text-white shadow-lg shadow-orange-500/30 transition hover:scale-[1.02] hover:from-orange-600 hover:to-red-600"
                            onClick={() => handleAddToCart(pizza, true)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Commander
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TiltedCard>
              </motion.article>
            ))}
          </div>

          {isLoading && (
            <p className="mt-6 text-center text-sm text-gray-400">Chargement des recettes en cours...</p>
          )}
        </div>
      </div>
    </section>
  );
}

