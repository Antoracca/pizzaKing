'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Sparkles,
  Tag,
  TrendingDown,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { MEAL_BUNDLES } from '@/data/mealBundles';

export default function MealBundles() {
  const { addItem } = useCart();

  const handleAddToCart = (bundleId: typeof MEAL_BUNDLES[number]['id'], shouldOpenCart: boolean) => {
    const bundle = MEAL_BUNDLES.find(item => item.id === bundleId);
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
      { openCart: shouldOpenCart }
    );
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 via-white to-white py-16 sm:py-20 lg:py-24">
      {/* Background Effect */}
      <div className="absolute inset-x-0 top-10 hidden h-96 w-full -rotate-3 rounded-full bg-gradient-to-r from-purple-200/30 via-pink-200/20 to-purple-200/30 blur-3xl md:block" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
          {/* Left Section - Info */}
          <div className="space-y-6 lg:w-[300px] lg:flex-shrink-0 lg:sticky lg:top-24">
            <Badge className="w-fit bg-purple-600 text-white lg:text-base lg:px-4 lg:py-2">
              <Tag className="mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
              Menus Économiques
            </Badge>

            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Nos Formules Complètes
              </h2>
              <p className="text-base text-gray-600 sm:text-lg lg:text-xl lg:leading-relaxed">
                Pizza + Boisson + Dessert. Des formules pensées pour vous faire économiser tout en vous régalant.
                Parfait pour tous les moments de la journée.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 lg:gap-5 lg:text-base">
              <span className="flex items-center gap-2 font-semibold">
                <TrendingDown className="h-4 w-4 text-purple-600 lg:h-5 lg:w-5" />
                Jusqu'à 10 000 FCFA d'économie
              </span>
              <span className="flex items-center gap-2 font-semibold">
                <Users className="h-4 w-4 text-purple-600 lg:h-5 lg:w-5" />
                Pour solo, duo ou famille
              </span>
              <span className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-purple-600 lg:h-5 lg:w-5" />
                Formules sur mesure
              </span>
            </div>

            {/* Info Box */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 text-sm text-purple-900 lg:p-6 lg:text-base">
              <div className="mb-2 flex items-center gap-2 font-semibold lg:mb-3">
                <Sparkles className="h-4 w-4 text-purple-600 lg:h-5 lg:w-5" />
                Points fidélité doublés
              </div>
              <p className="text-purple-800">
                Chaque menu vous rapporte des points bonus. Cumulez-les pour obtenir des réductions exclusives.
              </p>
            </div>
          </div>

          {/* Right Section - Bundles */}
          <div className="flex-1">
            <div className="flex items-center justify-between pb-4 lg:pb-6">
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl">
                Nos 3 formules
              </h3>
              <div className="text-sm text-gray-500 lg:text-base">
                Économisez jusqu'à 21%
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {MEAL_BUNDLES.map((bundle, index) => {
                const Icon = bundle.icon;
                return (
                  <motion.div
                    key={bundle.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                    className="h-full"
                  >
                    <Card className="group flex h-full flex-col overflow-hidden border border-purple-100 bg-white shadow-sm transition-shadow hover:shadow-lg lg:shadow-md lg:hover:shadow-xl">
                      {/* Header avec gradient */}
                      <div className={`relative overflow-hidden bg-gradient-to-br ${bundle.color} px-5 py-6 text-white lg:px-6 lg:py-8`}>
                        {/* Badge */}
                        <div className="absolute right-3 top-3 lg:right-4 lg:top-4">
                          <Badge className={`${bundle.badgeColor} border-0 text-xs font-semibold text-white lg:text-sm`}>
                            {bundle.badge}
                          </Badge>
                        </div>

                        {/* Icon & Title */}
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm lg:h-14 lg:w-14">
                            <Icon className="h-6 w-6 lg:h-7 lg:w-7" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold lg:text-2xl">{bundle.name}</h3>
                            <p className="text-xs text-white/90 lg:text-sm">{bundle.subtitle}</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="flex flex-1 flex-col gap-4 p-5 lg:gap-6 lg:p-7">
                        {/* Items List */}
                        <div className="space-y-2.5 lg:space-y-4">
                          {bundle.items.map((item, idx) => {
                            const ItemIcon = item.icon;
                            return (
                              <div
                                key={idx}
                                className={`flex items-start gap-2.5 rounded-lg p-2.5 transition-colors lg:gap-4 lg:p-4 ${
                                  item.highlight
                                    ? 'bg-purple-50 border border-purple-100'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg lg:h-10 lg:w-10 ${
                                  item.highlight
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-white text-gray-500'
                                }`}>
                                  <ItemIcon className="h-4 w-4 lg:h-6 lg:w-6" />
                                </div>
                                <p className={`flex-1 text-sm font-medium lg:text-lg ${
                                  item.highlight ? 'text-gray-900' : 'text-gray-600'
                                }`}>
                                  {item.text}
                                </p>
                                {item.highlight && (
                                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600 lg:h-6 lg:w-6" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Savings */}
                        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3.5 text-center lg:p-3.5">
                          <p className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700 lg:mb-1.5 lg:text-xs">
                            <TrendingDown className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            Vous économisez
                          </p>
                          <p className="text-2xl font-bold text-green-600 lg:text-xl">
                            {formatPrice(bundle.savings)}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="space-y-1 text-center lg:space-y-1.5">
                          <p className="text-xs text-gray-500 line-through lg:text-sm">
                            {formatPrice(bundle.originalPrice)}
                          </p>
                          <p className={`text-2xl font-bold bg-gradient-to-r ${bundle.color} bg-clip-text text-transparent lg:text-2xl`}>
                            {formatPrice(bundle.price)}
                          </p>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 lg:text-xs">
                            Prix formule complète
                          </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-auto flex flex-col gap-2 sm:flex-row lg:flex-col lg:gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 lg:h-12 lg:text-lg lg:font-semibold"
                            onClick={() => handleAddToCart(bundle.id, false)}
                          >
                            Ajouter au panier
                          </Button>
                          <Button
                            size="sm"
                            className={`w-full bg-gradient-to-r ${bundle.color} text-white hover:opacity-90 lg:h-12 lg:text-lg lg:font-semibold`}
                            onClick={() => handleAddToCart(bundle.id, true)}
                          >
                            Commander
                            <ArrowRight className="ml-1.5 h-4 w-4 lg:h-5 lg:w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
