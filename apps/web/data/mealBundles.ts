import {
  Pizza,
  Coffee,
  IceCream,
  Users,
  Heart,
} from 'lucide-react';

export type MealBundleId = 'solo' | 'duo' | 'famille';

export type MealBundleItem = {
  icon: typeof Pizza;
  text: string;
  highlight: boolean;
};

export type MealBundle = {
  id: MealBundleId;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  savings: number;
  icon: typeof Pizza;
  color: string;
  items: MealBundleItem[];
  badge: string;
  badgeColor: string;
};

export const MEAL_BUNDLES: MealBundle[] = [
  {
    id: 'solo',
    name: 'Menu Solo',
    subtitle: 'Parfait pour une personne',
    price: 12500,
    originalPrice: 15000,
    savings: 2500,
    icon: Pizza,
    color: 'from-purple-500 to-pink-500',
    items: [
      { icon: Pizza, text: '1 Pizza Moyenne au choix', highlight: true },
      { icon: Coffee, text: '1 Boisson 50cl', highlight: false },
      { icon: IceCream, text: '1 Dessert au choix', highlight: false },
    ],
    badge: 'Populaire',
    badgeColor: 'bg-purple-600',
  },
  {
    id: 'duo',
    name: 'Menu Duo',
    subtitle: 'Pour partager à deux',
    price: 22000,
    originalPrice: 27000,
    savings: 5000,
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    items: [
      { icon: Pizza, text: '2 Pizzas Moyennes au choix', highlight: true },
      { icon: Coffee, text: '2 Boissons 50cl', highlight: false },
      { icon: IceCream, text: '1 Dessert XL à partager', highlight: false },
    ],
    badge: 'Best Seller',
    badgeColor: 'bg-red-600',
  },
  {
    id: 'famille',
    name: 'Menu Famille',
    subtitle: 'Régalez toute la famille',
    price: 38000,
    originalPrice: 48000,
    savings: 10000,
    icon: Users,
    color: 'from-orange-500 to-amber-500',
    items: [
      { icon: Pizza, text: '2 Pizzas Familiales XXL', highlight: true },
      { icon: Coffee, text: '4 Boissons 50cl', highlight: false },
      { icon: IceCream, text: '4 Desserts au choix', highlight: false },
    ],
    badge: 'Meilleur Prix',
    badgeColor: 'bg-amber-600',
  },
];
