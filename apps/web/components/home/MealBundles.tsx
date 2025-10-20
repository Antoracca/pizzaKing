'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { MEAL_BUNDLES } from '@/data/mealBundles';

export default function MealBundles() {
  const { addItem } = useCart();

  const handleAddToCart = (
    bundleId: (typeof MEAL_BUNDLES)[number]['id'],
    shouldOpenCart: boolean
  ) => {
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
        extras: bundle.items
          .filter(item => item.highlight)
          .map(item => item.text),
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
        {/* Header */}
        <div className="mb-12 text-center lg:mb-16">
          <Badge className="mb-4 w-fit bg-purple-600 text-white">
            <Tag className="mr-2 h-4 w-4" />
            Menus Économiques
          </Badge>

          <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl lg:text-5xl">
            Nos Formules Complètes
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
            Pizza + Boisson + Dessert. Économisez jusqu'à 10 000 FCFA avec nos
            formules pensées pour vous régaler.
          </p>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {MEAL_BUNDLES.map((bundle, index) => {
            const Icon = bundle.icon;
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <Card className="group relative flex h-full flex-col overflow-hidden border-0 bg-white shadow-lg transition-all hover:shadow-2xl">
                  {/* Badge */}
                  <div className="absolute right-4 top-4 z-10">
                    <Badge
                      className={`${bundle.badgeColor} border-0 px-3 py-1 text-xs font-bold text-white shadow-md`}
                    >
                      {bundle.badge}
                    </Badge>
                  </div>

                  {/* Header with gradient */}
                  <div
                    className={`relative overflow-hidden bg-gradient-to-br ${bundle.color} px-6 py-8 text-white`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{bundle.name}</h3>
                        <p className="text-sm text-white/90">
                          {bundle.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    {/* Items List - Simplifié */}
                    <div className="mb-6 space-y-2">
                      {bundle.items.map((item, idx) => {
                        const ItemIcon = item.icon;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 text-gray-700"
                          >
                            <ItemIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                            <p className="text-sm font-medium">{item.text}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pricing Section */}
                    <div className="mt-auto space-y-4">
                      {/* Savings Badge */}
                      <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          Économie
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(bundle.savings)}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-center">
                        <p className="mb-1 text-sm text-gray-500 line-through">
                          {formatPrice(bundle.originalPrice)}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatPrice(bundle.price)}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <Button
                        size="lg"
                        className={`w-full bg-gradient-to-r ${bundle.color} text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
                        onClick={() => handleAddToCart(bundle.id, true)}
                      >
                        Commander maintenant
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 flex items-center justify-center gap-2 rounded-2xl bg-purple-50 px-6 py-4 text-center lg:mt-16">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <p className="text-sm font-semibold text-purple-900">
            Points fidélité doublés sur tous les menus
          </p>
        </div>
      </div>
    </section>
  );
}
