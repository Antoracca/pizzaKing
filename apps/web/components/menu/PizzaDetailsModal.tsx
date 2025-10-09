'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Star,
  Clock,
  Flame,
  Leaf,
  ShoppingCart,
  Heart,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface PizzaSize {
  size: 'small' | 'medium' | 'large';
  name: string;
  price: number;
  diameter: number;
}

interface PizzaCrust {
  type: string;
  name: string;
  priceModifier: number;
}

interface Ingredient {
  name: string;
  category: string;
  price: number;
  isDefault?: boolean;
}

interface Pizza {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  preparationTime: number;
  isSpicy: boolean;
  isVegetarian: boolean;
  calories: number;
  sizes: PizzaSize[];
  crusts: PizzaCrust[];
  ingredients: Ingredient[];
  availableIngredients: Ingredient[];
}

interface PizzaDetailsModalProps {
  pizza: Pizza | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (configuration: any) => void;
}

export default function PizzaDetailsModal({
  pizza,
  isOpen,
  onClose,
  onAddToCart,
}: PizzaDetailsModalProps) {
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [selectedCrust, setSelectedCrust] = useState<PizzaCrust | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!pizza) return null;

  // Initialize defaults
  if (!selectedSize && pizza.sizes.length > 0) {
    setSelectedSize(pizza.sizes[1]); // Medium by default
  }
  if (!selectedCrust && pizza.crusts.length > 0) {
    setSelectedCrust(pizza.crusts[0]); // First crust by default
  }

  const calculateTotalPrice = () => {
    let total = selectedSize?.price || pizza.basePrice;
    total += selectedCrust?.priceModifier || 0;

    selectedIngredients.forEach(ingredientName => {
      const ingredient = pizza.availableIngredients.find(
        i => i.name === ingredientName
      );
      if (ingredient) {
        total += ingredient.price;
      }
    });

    return total * quantity;
  };

  const handleAddToCart = () => {
    const configuration = {
      pizzaId: pizza.id,
      size: selectedSize,
      crust: selectedCrust,
      extraIngredients: selectedIngredients,
      quantity,
      totalPrice: calculateTotalPrice(),
    };
    onAddToCart(configuration);
    onClose();
  };

  const toggleIngredient = (ingredientName: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientName)
        ? prev.filter(i => i !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
                {/* Left Side - Image */}
                <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-8 flex items-center justify-center">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    {pizza.isSpicy && (
                      <Badge variant="destructive" className="gap-1">
                        <Flame className="w-3 h-3" />
                        Épicée
                      </Badge>
                    )}
                    {pizza.isVegetarian && (
                      <Badge variant="success" className="gap-1">
                        <Leaf className="w-3 h-3" />
                        Végétarien
                      </Badge>
                    )}
                  </div>

                  {/* Pizza Image */}
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <img
                      src={pizza.image}
                      alt={pizza.name}
                      className="relative w-full max-w-md rounded-full shadow-2xl"
                    />
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-6 right-6 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full shadow-lg"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full shadow-lg"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Right Side - Details & Customization */}
                <div className="flex flex-col max-h-[90vh]">
                  {/* Header - Fixed */}
                  <div className="p-8 border-b border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {pizza.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{pizza.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{pizza.rating}</span>
                        <span className="text-gray-500 text-sm">
                          ({pizza.reviewCount} avis)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span className="text-gray-700">
                          {pizza.preparationTime} min
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {pizza.calories} cal
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Size Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Choisissez votre taille
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {pizza.sizes.map(size => (
                          <button
                            key={size.size}
                            onClick={() => setSelectedSize(size)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedSize?.size === size.size
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            <div className="text-center">
                              <p className="font-semibold text-gray-900 mb-1">
                                {size.name}
                              </p>
                              <p className="text-xs text-gray-500 mb-2">
                                {size.diameter}cm
                              </p>
                              <p className="text-sm font-bold text-orange-600">
                                {formatPrice(size.price)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Crust Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Type de pâte
                      </h3>
                      <div className="space-y-2">
                        {pizza.crusts.map(crust => (
                          <button
                            key={crust.type}
                            onClick={() => setSelectedCrust(crust)}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                              selectedCrust?.type === crust.type
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            <span className="font-medium text-gray-900">
                              {crust.name}
                            </span>
                            {crust.priceModifier > 0 && (
                              <span className="text-sm text-orange-600 font-semibold">
                                +{formatPrice(crust.priceModifier)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Extra Ingredients */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Ingrédients supplémentaires
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {pizza.availableIngredients.map(ingredient => {
                          const isSelected = selectedIngredients.includes(
                            ingredient.name
                          );
                          return (
                            <button
                              key={ingredient.name}
                              onClick={() => toggleIngredient(ingredient.name)}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-orange-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {ingredient.name}
                                </span>
                                <span className="text-xs text-orange-600 font-semibold">
                                  +{formatPrice(ingredient.price)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Default Ingredients Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Ingrédients inclus:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {pizza.ingredients.map(i => i.name).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Footer - Fixed */}
                  <div className="p-8 border-t border-gray-100 bg-white">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">
                        Quantité
                      </span>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-xl font-bold w-12 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      size="lg"
                      className="w-full text-lg"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Ajouter - {formatPrice(calculateTotalPrice())}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
