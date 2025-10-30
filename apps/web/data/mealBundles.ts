

import { Coffee, Heart, IceCream, Pizza, Users } from 'lucide-react';

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
  tagline: string;
  vibe: string;
  ctaLabel: string;
  ctaSubLabel: string;
  description: string;
  highlights: string[];
  items: MealBundleItem[];
  badge: string;
  badgeColor: string;
};

export const MEAL_BUNDLES: MealBundle[] = [
  {
    id: 'solo',
    name: 'Menu Solo',
    subtitle: 'Parfait pour une personne',
    price: 328,
    originalPrice: 500,
    savings: 172,
    icon: Pizza,
    color: 'from-orange-500 to-red-600',
    tagline: 'Un combo généreux pour se faire plaisir sans partager.',
    vibe: 'Pause solo gourmande',
    ctaLabel: 'Ajouter le menu Solo',
    ctaSubLabel: 'Livraison rapide · Points fidélité x2',
    description:
      'Notre menu solo rassemble ta pizza préférée, une boisson bien fraîche et un dessert maison pour terminer sur une note sucrée.',
    highlights: [
      'Prêt en 20 minutes',
      'Dessert signature inclus',
      'Parfait pour les soirées série',
    ],
    items: [
      { icon: Pizza, text: '1 Pizza Moyenne au choix', highlight: true },
      { icon: Coffee, text: '1 Boisson 50cl', highlight: false },
      { icon: IceCream, text: '1 Dessert au choix', highlight: false },
    ],
    badge: 'Populaire',
    badgeColor: 'bg-orange-600',
  },
  {
    id: 'duo',
    name: 'Menu Duo',
    subtitle: 'Pour partager à deux',
    price: 8900,
    originalPrice: 11500,
    savings: 2600,
    icon: Heart,
    color: 'from-red-500 to-orange-600',
    tagline: 'Le meilleur plan pour un moment à deux autour d’une bonne pizza.',
    vibe: 'Formule duo',
    ctaLabel: 'Ajouter le menu Duo',
    ctaSubLabel: 'Pizza offerte le jeudi soir',
    description:
      'Deux pizzas gourmandes, deux boissons bien fraîches et un grand dessert à partager. Idéal pour un dîner relax à la maison.',
    highlights: [
      '1 pizza offerte le jeudi après 19h',
      'Dessert XL à partager',
      'Option croûte fromage disponible',
    ],
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
    price: 23900,
    originalPrice: 30000,
    savings: 6100,
    icon: Users,
    color: 'from-red-500 to-orange-600',
    tagline: 'Un festin complet pour régaler toute la table sans se compliquer.',
    vibe: 'Menu famille',
    ctaLabel: 'Ajouter le menu Famille',
    ctaSubLabel: 'Livraison prioritaire week-end',
    description:
      'Deux pizzas XXL croustillantes, quatre boissons et quatre desserts. On s’occupe du dîner pendant que vous profitez.',
    highlights: [
      'Livraison prioritaire le week-end',
      'Desserts au choix pour chaque convive',
      'Convient pour 4 à 5 personnes',
    ],
    items: [
      { icon: Pizza, text: '2 Pizzas Familiales XXL', highlight: true },
      { icon: Coffee, text: '4 Boissons 50cl', highlight: false },
      { icon: IceCream, text: '4 Desserts au choix', highlight: false },
    ],
    badge: 'Meilleur Prix',
    badgeColor: 'bg-orange-600',
  },
];
