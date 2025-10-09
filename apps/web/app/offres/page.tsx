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
  ShoppingBag
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
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=800&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=800&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=800&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=800&fit=crop&q=80',
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
        'Livraison suivie en temps réel'
      ]
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
        '1 dessert offert / mois'
      ]
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
        'Support client prioritaire'
      ]
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
        'Cadeaux d\'anniversaire premium'
      ]
    }
  ],
  howItWorks: [
    { step: '1', text: '10 points = 100 FCFA dépensés', icon: ShoppingBag },
    { step: '2', text: 'Cumulez vos points à chaque commande', icon: TrendingUp },
    { step: '3', text: 'Débloquez des récompenses exclusives', icon: Gift },
  ]
};

// Codes Promo (style minimaliste)
const promoCodes = [
  {
    code: 'BIENVENUE20',
    discount: '-20%',
    description: 'Votre première commande',
    minOrder: 0,
    color: 'from-purple-600 to-pink-600'
  },
  {
    code: 'WEEKEND30',
    discount: '-30%',
    description: 'Tous les week-ends',
    minOrder: 10000,
    color: 'from-blue-600 to-cyan-600'
  },
  {
    code: 'FAMILLE15',
    discount: '-15%',
    description: 'Commande famille (3 pizzas+)',
    minOrder: 20000,
    color: 'from-orange-600 to-red-600'
  }
];

export default function OffresPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredDeal, setHoveredDeal] = useState<number | null>(null);
  const { addItem } = useCart();

  const handleChooseBundle = (bundleId: typeof MEAL_BUNDLES[number]['id']) => {
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
        extras: bundle.items.filter(item => item.highlight).map(item => item.text),
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
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 lg:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-block mb-6"
            >
              <div className="text-6xl lg:text-7xl">🎁</div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-black mb-4"
            >
              Offres & Promotions
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg lg:text-xl text-gray-300"
            >
              Économisez jusqu'à <span className="text-orange-400 font-black">30%</span> sur vos commandes
            </motion.p>
          </div>
        </div>
      </section>

      {/* Codes Promo - Style minimaliste et pro */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Codes Promo Actifs
              </h2>
              <p className="text-gray-600">
                Utilisez ces codes lors de votre commande
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {promoCodes.map((promo, index) => (
                <motion.div
                  key={promo.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="border-2 hover:border-orange-300 transition-all hover:shadow-lg h-full">
                    <CardContent className="p-5 h-full flex flex-col">
                      <div className="text-center flex-1 flex flex-col">
                        <div className={`inline-block bg-gradient-to-r ${promo.color} text-white px-4 py-2 rounded-lg mb-4 self-center`}>
                          <p className="text-2xl font-black">{promo.discount}</p>
                        </div>
                        <h3 className="font-black text-gray-900 mb-2 min-h-[3rem] flex items-center justify-center">{promo.description}</h3>
                        <div className="bg-gray-100 rounded-lg px-4 py-3 mb-3">
                          <code className="text-lg font-bold text-gray-900 tracking-wider">
                            {promo.code}
                          </code>
                        </div>
                        <div className="min-h-[2rem] flex items-center justify-center">
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
      <section className="py-12 lg:py-16 relative overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 right-10 w-[600px] h-[600px] bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-pink-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 px-6 py-3 rounded-full shadow-lg border border-purple-200 mb-6"
            >
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-black text-purple-700 uppercase tracking-widest">
                💰 Forfaits Complets
              </span>
            </motion.div>

            <h2 className="text-3xl lg:text-5xl font-black mb-4">
              Économisez
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Avec Nos Menus
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pizza + Boisson + Dessert = Bonheur garanti ! 🎉
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
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
                    className="absolute -top-4 -right-4 z-20"
                  >
                    <div className={`${bundle.badgeColor} text-white px-6 py-2 rounded-full text-sm font-black uppercase shadow-2xl flex items-center space-x-2`}>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{bundle.badge}</span>
                    </div>
                  </motion.div>

                  <Card className="relative overflow-hidden border-4 border-gray-100 hover:border-purple-300 transition-all duration-700 hover:shadow-2xl hover:shadow-purple-500/30 h-full bg-white">
                    <div className={`relative h-44 lg:h-48 bg-gradient-to-br ${bundle.color} p-7 flex flex-col justify-between overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                          backgroundSize: '30px 30px'
                        }} />
                      </div>

                      <motion.div
                        animate={{
                          rotate: hoveredId === bundle.id ? 360 : 0,
                          scale: hoveredId === bundle.id ? 1.15 : 1,
                        }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                      >
                        <Icon className="w-14 h-14 lg:w-16 lg:h-16 text-white drop-shadow-2xl" />
                      </motion.div>

                      <div className="relative">
                        <h3 className="text-2xl lg:text-3xl font-black text-white mb-1 drop-shadow-lg">
                          {bundle.name}
                        </h3>
                        <p className="text-white/90 font-bold text-sm">
                          {bundle.subtitle}
                        </p>
                      </div>

                      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                      <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/20 rounded-full blur-xl" />
                    </div>

                    <CardContent className="p-6 lg:p-7 space-y-5">
                      <div className="space-y-3">
                        {bundle.items.map((item, idx) => {
                          const ItemIcon = item.icon;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center space-x-3 ${item.highlight ? 'bg-purple-50 -mx-3 px-3 py-2.5 rounded-xl' : ''}`}
                            >
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.highlight ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gray-100'}`}>
                                <ItemIcon className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <p className={`font-bold text-sm ${item.highlight ? 'text-gray-900' : 'text-gray-600'} leading-tight`}>
                                {item.text}
                              </p>
                              {item.highlight && (
                                <Check className="w-4 h-4 text-purple-600 ml-auto flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-center">
                        <p className="text-sm text-green-700 font-bold mb-1">💰 Vous économisez</p>
                        <p className="text-3xl font-black text-green-600">
                          {formatPrice(bundle.savings)}
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-gray-100 pt-5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 line-through font-semibold">
                            Prix normal: {formatPrice(bundle.originalPrice)}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Prix Menu</p>
                          <p className={`text-4xl lg:text-5xl font-black bg-gradient-to-r ${bundle.color} bg-clip-text text-transparent leading-none`}>
                            {formatPrice(bundle.price)}
                          </p>
                        </div>
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r ${bundle.color} hover:opacity-90 text-white font-black text-base py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all group/btn`}
                        onClick={() => handleChooseBundle(bundle.id)}
                      >
                        <span>Choisir ce Menu</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
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
      <section className="py-12 lg:py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-full mb-6">
                <Zap className="w-5 h-5 fill-current" />
                <span className="font-black uppercase tracking-wider">Offres Flash</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Jusqu'à -30% Aujourd'hui
              </h2>
              <p className="text-gray-600">
                Stock limité • Offres valables pendant quelques heures
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
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
                  <Card className="overflow-hidden border-2 hover:border-red-300 transition-all hover:shadow-xl h-full flex flex-col">
                    <div className="relative">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full aspect-square object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-red-600 text-white font-black text-xs">
                        -{deal.discount}%
                      </Badge>
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md">
                        <p className="text-xs font-black text-gray-900">{deal.badge}</p>
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-black text-gray-900 mb-1 text-sm min-h-[2.5rem] flex items-center">
                        {deal.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                        {deal.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(deal.originalPrice)}
                          </p>
                          <p className="text-xl font-black text-red-600">
                            {formatPrice(deal.salePrice)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {deal.timeLeft}
                          </span>
                          <span className={`font-bold ${deal.stockLeft < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            {deal.stockLeft} restants
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-2 rounded-lg text-sm mt-auto"
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
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full mb-6">
                <Crown className="w-5 h-5" />
                <span className="font-black uppercase tracking-wider">Programme Fidélité</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">
                Gagnez des Points,
                <br />
                <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
                  Récoltez des Récompenses
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Chaque commande vous rapproche de pizzas gratuites et d'avantages exclusifs
              </p>
            </motion.div>

            {/* Comment ça marche */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
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
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-black text-orange-600 mb-2">{step.step}</div>
                    <p className="text-sm font-semibold text-gray-700">{step.text}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {loyaltyProgram.tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className={`border-2 hover:shadow-xl transition-all h-full flex flex-col ${
                    tier.name === 'Or' ? 'border-yellow-400 shadow-lg shadow-yellow-100' : 'border-gray-200'
                  }`}>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-3">{tier.icon}</div>
                        <h3 className="text-xl font-black text-gray-900 mb-1 min-h-[2rem] flex items-center justify-center">
                          {tier.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-semibold">
                          {tier.points}
                        </p>
                      </div>
                      <div className="space-y-2 flex-1">
                        {tier.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700 leading-tight">{benefit}</span>
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
              className="text-center mt-10"
            >
              <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-black px-10 py-4 rounded-xl shadow-xl text-lg">
                <Crown className="w-5 h-5 mr-2" />
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
