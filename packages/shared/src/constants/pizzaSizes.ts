import { PizzaSize } from '../types';

export const PIZZA_SIZES: PizzaSize[] = ['S', 'M', 'L', 'XL'];

export const PIZZA_SIZE_LABELS: Record<PizzaSize, string> = {
  S: 'Petite (20cm)',
  M: 'Moyenne (30cm)',
  L: 'Grande (40cm)',
  XL: 'Extra-Large (50cm)',
};

export const PIZZA_SIZE_SERVINGS: Record<PizzaSize, string> = {
  S: '1-2 personnes',
  M: '2-3 personnes',
  L: '3-4 personnes',
  XL: '4-6 personnes',
};

export const PIZZA_SIZE_PRICE_FACTORS: Record<PizzaSize, number> = {
  S: 0.85,
  M: 1,
  L: 1.3,
  XL: 1.55,
};
