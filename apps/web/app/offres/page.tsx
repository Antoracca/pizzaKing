'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Gift,
  Crown,
  Star,
  TrendingUp,
  Percent,
  Clock,
  Tag,
  Award,
  ShoppingBag,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { MEAL_BUNDLES } from '@/data/mealBundles';
import { useCart } from '@/hooks/useCart';

// Menus Bundles (copié depuis MealBundles avec responsive)
// Offres Flash (style Apple/Amazon)
const flashDeals = [
  {
    id: 1,
    name: 'Margherita Royale',
    description: 'Tomate San Marzano, mozzarella di bufala DOP, basilic frais',
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=800&fit=crop&q=80',
    originalPrice: 5500,
    salePrice: 3900,
    discount: 29,
    badge: '⚡ Flash Sale',
    timeLeft: '2h 15min',
    stockLeft: 8,
  },
  {
    id: 2,
    name: 'Pepperoni Suprême',
    description: 'Triple pepperoni premium, mozzarella généreuse, origan',
    image:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=800&fit=crop&q=80',
    originalPrice: 7500,
    salePrice: 5250,
    discount: 30,
    badge: '🔥 Populaire',
    timeLeft: '1h 45min',
    stockLeft: 5,
  },
  {
    id: 3,
    name: 'Quatre Fromages',
    description: 'Mozzarella, gorgonzola, parmesan, emmental, crème',
    image:
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=800&fit=crop&q=80',
    originalPrice: 8500,
    salePrice: 5950,
    discount: 30,
    badge: '🎯 Offre du Jour',
    timeLeft: '3h 30min',
    stockLeft: 12,
  },
  {
    id: 4,
    name: 'Végétarienne Deluxe',
    description: 'Poivrons, champignons, olives, aubergines, mozzarella',
    image:
      'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=800&fit=crop&q=80',
    originalPrice: 7000,
    salePrice: 4900,
    discount: 30,
    badge: '🌱 Healthy',
    timeLeft: '4h 10min',
    stockLeft: 15,
  },
];

// Programme Fidélité (style Starbucks Rewards)
const loyaltyProgram = {
  tiers: [
    {
      name: 'Membre',
      icon: '🍕',
      points: '0-99 pts',
      color: 'from-gray-600 to-gray-700',
      benefits: [
        'Accès aux offres exclusives',
        'Notification des nouveautés',
        'Livraison suivie en temps réel',
      ],
    },
    {
      name: 'Bronze',
      icon: '🥉',
      points: '100-299 pts',
      color: 'from-amber-700 to-amber-800',
      benefits: [
        'Tous les avantages Membre',
        '5% de réduction permanente',
        'Livraison prioritaire',
        '1 dessert offert / mois',
      ],
    },
    {
      name: 'Argent',
      icon: '🥈',
      points: '300-599 pts',
      color: 'from-gray-400 to-gray-600',
      benefits: [
        'Tous les avantages Bronze',
        '10% de réduction permanente',
        'Livraison gratuite dès 5000 FCFA',
        '1 pizza moyenne offerte / mois',
        'Support client prioritaire',
      ],
    },
    {
      name: 'Or',
      icon: '🥇',
      points: '600+ pts',
      color: 'from-yellow-400 to-yellow-600',
      benefits: [
        'Tous les avantages Argent',
        '15% de réduction permanente',
        'Livraison gratuite illimitée',
        '1 menu gratuit / mois',
        'Accès VIP aux événements',
        "Cadeaux d'anniversaire premium",
      ],
    },
  ],
  howItWorks: [
    { step: '1', text: '10 points = 100 FCFA dépensés', icon: ShoppingBag },
    {
      step: '2',
      text: 'Cumulez vos points à chaque commande',
      icon: TrendingUp,
    },
    { step: '3', text: 'Débloquez des récompenses exclusives', icon: Gift },
  ],
};

// Codes Promo (style minimaliste)
const promoCodes = [
  {
    code: 'BIENVENUE20',
    discount: '-20%',
    description: 'Votre première commande',
    minOrder: 0,
    color: 'from-purple-600 to-pink-600',
  },
  {
    code: 'WEEKEND30',
    discount: '-30%',
    description: 'Tous les week-ends',
    minOrder: 10000,
    color: 'from-blue-600 to-cyan-600',
  },
  {
    code: 'FAMILLE15',
    discount: '-15%',
    description: 'Commande famille (3 pizzas+)',
    minOrder: 20000,
    color: 'from-orange-600 to-red-600',
  },
];

export default function OffresPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredDeal, setHoveredDeal] = useState<number | null>(null);
  const { addItem } = useCart();

  const handleChooseBundle = (
    bundleId: (typeof MEAL_BUNDLES)[number]['id']
  ) => {
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

  const handleAddDealToCart = (deal: (typeof flashDeals)[number]) => {
    addItem({
      productId: `flash-${deal.id}`,
      name: deal.name,
      image: deal.image,
      description: deal.description,
      price: deal.salePrice,
      category: 'flash-deal',
      metadata: {
        Remise: `-${deal.discount}%`,
        'Temps restant': deal.timeLeft,
      },
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Style élégant comme page menu */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 text-white lg:py-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, #f97316 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="mb-6 inline-block"
            >
              <div className="text-6xl lg:text-7xl">🎁</div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-4xl font-black lg:text-6xl"
            >
              Offres & Promotions
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-300 lg:text-xl"
            >
              Économisez jusqu'à{' '}
              <span className="font-black text-orange-400">30%</span> sur vos
              commandes
            </motion.p>
          </div>
        </div>
      </section>

      {/* Codes Promo - Style minimaliste et pro */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center"
            >
              <h2 className="mb-3 text-3xl font-black text-gray-900 lg:text-4xl">
                Codes Promo Actifs
              </h2>
              <p className="text-gray-600">
                Utilisez ces codes lors de votre commande
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
              {promoCodes.map((promo, index) => (
                <motion.div
                  key={promo.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="h-full border-2 transition-all hover:border-orange-300 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="flex flex-1 flex-col text-center">
                        <div
                          className={`inline-block bg-gradient-to-r ${promo.color} mb-4 self-center rounded-lg px-4 py-2 text-white`}
                        >
                          <p className="text-2xl font-black">
                            {promo.discount}
                          </p>
                        </div>
                        <h3 className="mb-2 flex min-h-[3rem] items-center justify-center font-black text-gray-900">
                          {promo.description}
                        </h3>
                        <div className="mb-3 rounded-lg bg-gray-100 px-4 py-3">
                          <code className="text-lg font-bold tracking-wider text-gray-900">
                            {promo.code}
                          </code>
                        </div>
                        <div className="flex min-h-[2rem] items-center justify-center">
                          {promo.minOrder > 0 ? (
                            <p className="text-xs text-gray-500">
                              Commande min: {formatPrice(promo.minOrder)}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Sans minimum
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Menus Bundles - Copié exactement depuis MealBundles */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white py-12 lg:py-16">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute right-10 top-20 h-[600px] w-[600px] rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute bottom-20 left-10 h-[500px] w-[500px] rounded-full bg-pink-500 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center lg:mb-16"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6 inline-flex items-center space-x-3 rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 px-6 py-3 shadow-lg"
            >
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-black uppercase tracking-widest text-purple-700">
                💰 Forfaits Complets
              </span>
            </motion.div>

            <h2 className="mb-4 text-3xl font-black lg:text-5xl">
              Économisez
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Avec Nos Menus
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Pizza + Boisson + Dessert = Bonheur garanti ! 🎉
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {MEAL_BUNDLES.map((bundle, index) => {
              const Icon = bundle.icon;
              return (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  onHoverStart={() => setHoveredId(bundle.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="group relative"
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                    className="absolute -right-4 -top-4 z-20"
                  >
                    <div
                      className={`${bundle.badgeColor} flex items-center space-x-2 rounded-full px-6 py-2 text-sm font-black uppercase text-white shadow-2xl`}
                    >
                      <Zap className="h-4 w-4 fill-current" />
                      <span>{bundle.badge}</span>
                    </div>
                  </motion.div>

                  <Card className="relative h-full overflow-hidden border-4 border-gray-100 bg-white transition-all duration-700 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/30">
                    <div
                      className={`relative h-44 bg-gradient-to-br lg:h-48 ${bundle.color} flex flex-col justify-between overflow-hidden p-7`}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle, white 2px, transparent 2px)',
                            backgroundSize: '30px 30px',
                          }}
                        />
                      </div>

                      <motion.div
                        animate={{
                          rotate: hoveredId === bundle.id ? 360 : 0,
                          scale: hoveredId === bundle.id ? 1.15 : 1,
                        }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                      >
                        <Icon className="h-14 w-14 text-white drop-shadow-2xl lg:h-16 lg:w-16" />
                      </motion.div>

                      <div className="relative">
                        <h3 className="mb-1 text-2xl font-black text-white drop-shadow-lg lg:text-3xl">
                          {bundle.name}
                        </h3>
                        <p className="text-sm font-bold text-white/90">
                          {bundle.subtitle}
                        </p>
                      </div>

                      <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-xl" />
                    </div>

                    <CardContent className="space-y-5 p-6 lg:p-7">
                      <div className="space-y-3">
                        {bundle.items.map((item, idx) => {
                          const ItemIcon = item.icon;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center space-x-3 ${item.highlight ? '-mx-3 rounded-xl bg-purple-50 px-3 py-2.5' : ''}`}
                            >
                              <div
                                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${item.highlight ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gray-100'}`}
                              >
                                <ItemIcon
                                  className={`h-5 w-5 ${item.highlight ? 'text-white' : 'text-gray-600'}`}
                                />
                              </div>
                              <p
                                className={`text-sm font-bold ${item.highlight ? 'text-gray-900' : 'text-gray-600'} leading-tight`}
                              >
                                {item.text}
                              </p>
                              {item.highlight && (
                                <Check className="ml-auto h-4 w-4 flex-shrink-0 text-purple-600" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-center">
                        <p className="mb-1 text-sm font-bold text-green-700">
                          💰 Vous économisez
                        </p>
                        <p className="text-3xl font-black text-green-600">
                          {formatPrice(bundle.savings)}
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-gray-100 pt-5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 line-through">
                            Prix normal: {formatPrice(bundle.originalPrice)}
                          </span>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                            Prix Menu
                          </p>
                          <p
                            className={`bg-gradient-to-r text-4xl font-black lg:text-5xl ${bundle.color} bg-clip-text leading-none text-transparent`}
                          >
                            {formatPrice(bundle.price)}
                          </p>
                        </div>
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r ${bundle.color} group/btn rounded-2xl py-5 text-base font-black text-white shadow-xl transition-all hover:opacity-90 hover:shadow-2xl`}
                        onClick={() => handleChooseBundle(bundle.id)}
                      >
                        <span>Choisir ce Menu</span>
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flash Deals - Style Amazon/Apple */}
      <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center"
            >
              <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-red-600 px-6 py-2 text-white">
                <Zap className="h-5 w-5 fill-current" />
                <span className="font-black uppercase tracking-wider">
                  Offres Flash
                </span>
              </div>
              <h2 className="mb-3 text-3xl font-black text-gray-900 lg:text-4xl">
                Jusqu'à -30% Aujourd'hui
              </h2>
              <p className="text-gray-600">
                Stock limité • Offres valables pendant quelques heures
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {flashDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredDeal(deal.id)}
                  onHoverEnd={() => setHoveredDeal(null)}
                  className="h-full"
                >
                  <Card className="flex h-full flex-col overflow-hidden border-2 transition-all hover:border-red-300 hover:shadow-xl">
                    <div className="relative">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="aspect-square w-full object-cover"
                      />
                      <Badge className="absolute left-2 top-2 bg-red-600 text-xs font-black text-white">
                        -{deal.discount}%
                      </Badge>
                      <div className="absolute right-2 top-2 rounded-md bg-white/95 px-2 py-1 backdrop-blur-sm">
                        <p className="text-xs font-black text-gray-900">
                          {deal.badge}
                        </p>
                      </div>
                    </div>
                    <CardContent className="flex flex-1 flex-col p-4">
                      <h3 className="mb-1 flex min-h-[2.5rem] items-center text-sm font-black text-gray-900">
                        {deal.name}
                      </h3>
                      <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-xs text-gray-600">
                        {deal.description}
                      </p>

                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(deal.originalPrice)}
                          </p>
                          <p className="text-xl font-black text-red-600">
                            {formatPrice(deal.salePrice)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center text-gray-600">
                            <Clock className="mr-1 h-3 w-3" />
                            {deal.timeLeft}
                          </span>
                          <span
                            className={`font-bold ${deal.stockLeft < 10 ? 'text-red-600' : 'text-green-600'}`}
                          >
                            {deal.stockLeft} restants
                          </span>
                        </div>
                      </div>

                      <Button
                        className="mt-auto w-full rounded-lg bg-gradient-to-r from-red-600 to-orange-600 py-2 text-sm font-bold text-white hover:from-red-700 hover:to-orange-700"
                        onClick={() => handleAddDealToCart(deal)}
                      >
                        Ajouter au panier
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programme Fidélité - Style Starbucks Rewards */}
      <section className="bg-white py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 text-gray-900">
                <Crown className="h-5 w-5" />
                <span className="font-black uppercase tracking-wider">
                  Programme Fidélité
                </span>
              </div>
              <h2 className="mb-4 text-3xl font-black text-gray-900 lg:text-5xl">
                Gagnez des Points,
                <br />
                <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
                  Récoltez des Récompenses
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Chaque commande vous rapproche de pizzas gratuites et
                d'avantages exclusifs
              </p>
            </motion.div>

            {/* Comment ça marche */}
            <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              {loyaltyProgram.howItWorks.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="mb-2 text-2xl font-black text-orange-600">
                      {step.step}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {step.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Tiers */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {loyaltyProgram.tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    className={`flex h-full flex-col border-2 transition-all hover:shadow-xl ${
                      tier.name === 'Or'
                        ? 'border-yellow-400 shadow-lg shadow-yellow-100'
                        : 'border-gray-200'
                    }`}
                  >
                    <CardContent className="flex flex-1 flex-col p-5">
                      <div className="mb-4 text-center">
                        <div className="mb-3 text-5xl">{tier.icon}</div>
                        <h3 className="mb-1 flex min-h-[2rem] items-center justify-center text-xl font-black text-gray-900">
                          {tier.name}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500">
                          {tier.points}
                        </p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {tier.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span className="text-xs leading-tight text-gray-700">
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 text-center"
            >
              <Button className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-10 py-4 text-lg font-black text-gray-900 shadow-xl hover:from-yellow-500 hover:to-orange-600">
                <Crown className="mr-2 h-5 w-5" />
                Rejoindre le Programme
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
