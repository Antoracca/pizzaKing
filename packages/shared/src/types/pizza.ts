import { Timestamp } from 'firebase/firestore';

export type PizzaCategory =
  | 'classic'
  | 'special'
  | 'vegetarian'
  | 'meat-lovers'
  | 'premium';

export type PizzaSize = 'S' | 'M' | 'L' | 'XL';
export type PizzaStatus = 'active' | 'draft' | 'archived';

export interface PizzaPricing {
  S: { price: number; size: string };
  M: { price: number; size: string };
  L: { price: number; size: string };
  XL: { price: number; size: string };
}

export interface Ingredient {
  id: string;
  name: string;
  isRemovable: boolean;
  extraPrice?: number;
}

export interface CrustType {
  id: string;
  name: string;
  extraPrice: number;
}

export interface Sauce {
  id: string;
  name: string;
  extraPrice: number;
}

export interface ExtraTopping {
  id: string;
  name: string;
  price: number;
}

export interface PizzaCustomizationOptions {
  crustTypes: CrustType[];
  sauces: Sauce[];
  extraToppings: ExtraTopping[];
}

export interface PizzaNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PizzaStats {
  totalOrders: number;
  averageRating: number;
  reviewCount: number;
  popularityScore: number;
}

export interface PizzaImages {
  main: string;
  thumbnail: string;
  gallery?: string[];
}

export interface Pizza {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: PizzaImages;
  category: PizzaCategory;
  tags: string[];
  pricing: PizzaPricing;
  ingredients: Ingredient[];
  allergens: string[];
  customizationOptions: PizzaCustomizationOptions;
  nutrition?: PizzaNutrition;
  isAvailable: boolean;
  availableFrom?: string;
  availableUntil?: string;
  status: PizzaStatus;
  featured: boolean;
  stats: PizzaStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
