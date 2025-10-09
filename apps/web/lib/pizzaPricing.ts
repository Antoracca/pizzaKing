'use client';

import {
  PIZZA_SIZES,
  PIZZA_SIZE_LABELS,
  PIZZA_SIZE_SERVINGS,
  PIZZA_SIZE_PRICE_FACTORS,
  PizzaSize,
} from '@pizza-king/shared';

type PizzaSizeVariant = {
  id: PizzaSize;
  label: string;
  description: string;
  price: number;
};

const DEFAULT_PIZZA_SIZE: PizzaSize = 'M';

export function getPizzaSizeVariants(basePrice: number): PizzaSizeVariant[] {
  return PIZZA_SIZES.map(size => {
    const factor = PIZZA_SIZE_PRICE_FACTORS[size];
    const price = Math.max(0, Math.round(basePrice * factor));

    return {
      id: size,
      label: PIZZA_SIZE_LABELS[size],
      description: PIZZA_SIZE_SERVINGS[size],
      price,
    };
  });
}

export function getDefaultPizzaSizeId(): PizzaSize {
  return DEFAULT_PIZZA_SIZE;
}

export function resolvePizzaVariant(
  variants: PizzaSizeVariant[],
  preferredSizeId?: PizzaSize
): PizzaSizeVariant {
  if (preferredSizeId) {
    const exact = variants.find(variant => variant.id === preferredSizeId);
    if (exact) {
      return exact;
    }
  }

  const fallback = variants.find(variant => variant.id === DEFAULT_PIZZA_SIZE);
  return fallback ?? variants[0];
}
