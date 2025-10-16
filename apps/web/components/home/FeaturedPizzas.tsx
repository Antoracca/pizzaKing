'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Flame,
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
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-white py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-x-0 top-10 hidden h-96 w-full rotate-3 rounded-full bg-gradient-to-r from-orange-200/30 via-red-200/20 to-orange-200/30 blur-3xl md:block" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <div className="space-y-6 lg:sticky lg:top-24 lg:w-1/3">
            <Badge className="w-fit bg-orange-600 text-white lg:px-4 lg:py-2 lg:text-base">
              Best Sellers
            </Badge>
            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Les pizzas incontournables
              </h2>
              <p className="text-base text-gray-600 sm:text-lg lg:text-xl lg:leading-relaxed">
                Recettes signature, ingrédients premium et cuisson minute au
                four à pierre. Goûtez à l'équilibre parfait entre tradition et
                créativité.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 lg:gap-5 lg:text-base">
              <span className="flex items-center gap-2 font-semibold">
                <Star className="h-4 w-4 text-orange-500 lg:h-5 lg:w-5" />
                Note moyenne 4.9/5
              </span>
              <span className="flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4 text-orange-500 lg:h-5 lg:w-5" />
                Prêt en 15 min
              </span>
              <span className="flex items-center gap-2 font-semibold">
                <ShoppingCart className="h-4 w-4 text-orange-500 lg:h-5 lg:w-5" />
                Livraison express
              </span>
            </div>

            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 lg:text-base"
            >
              Découvrir toute la carte
              <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
            </Link>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between pb-4 lg:pb-6">
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl">
                Sélection du moment
              </h3>
              <div className="text-sm text-gray-500 lg:text-base">
                {displayedPizzas.length} suggestions à partager
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 lg:gap-8">
              {displayedPizzas.map((pizza, index) => (
                <motion.div
                  key={pizza.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  className="h-full"
                >
                  <Card className="group flex h-full flex-col overflow-hidden border border-orange-100 bg-white shadow-sm transition-shadow hover:shadow-lg lg:shadow-md lg:hover:shadow-xl">
                    <div className="relative h-48 w-full overflow-hidden bg-orange-50 sm:h-52 lg:h-56">
                      <Image
                        src={pizza.image}
                        alt={pizza.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
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

                    <CardContent className="flex flex-1 flex-col gap-4 p-5 lg:gap-6 lg:p-7">
                      <div className="space-y-2 lg:space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 lg:text-2xl lg:font-bold">
                            {pizza.name}
                          </h3>
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600 lg:px-5 lg:py-2 lg:text-base">
                            {formatPrice(pizza.price)}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-gray-600 lg:text-lg lg:leading-relaxed">
                          {pizza.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 lg:gap-4 lg:text-base">
                        <span className="flex items-center gap-1 lg:gap-2">
                          <Star className="h-3.5 w-3.5 text-orange-500 lg:h-5 lg:w-5" />
                          {pizza.rating.toFixed(1)} ({pizza.reviews} avis)
                        </span>
                        <span className="flex items-center gap-1 lg:gap-2">
                          <Clock className="h-3.5 w-3.5 text-orange-500 lg:h-5 lg:w-5" />
                          {pizza.prepTime}
                        </span>
                        <span className="hidden items-center gap-1 sm:flex lg:gap-2">
                          <ShoppingCart className="h-3.5 w-3.5 text-orange-500 lg:h-5 lg:w-5" />
                          {pizza.loves.toLocaleString()} commandes
                        </span>
                      </div>

                      <div className="mt-auto flex flex-col gap-2 sm:flex-row lg:flex-col lg:gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 lg:h-12 lg:text-lg lg:font-semibold"
                          onClick={() => handleAddToCart(pizza, false)}
                        >
                          <Plus className="mr-1.5 h-4 w-4 lg:h-5 lg:w-5" />
                          Ajouter
                        </Button>
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 lg:h-12 lg:text-lg lg:font-semibold"
                          onClick={() => handleAddToCart(pizza, true)}
                        >
                          <ShoppingCart className="mr-1.5 h-4 w-4 lg:h-5 lg:w-5" />
                          Commander
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {isLoading && (
              <p className="mt-6 text-sm text-gray-400">
                Chargement des recettes en cours…
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
