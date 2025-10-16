'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Star,
  Flame,
  Leaf,
  Plus,
  Heart,
  Clock,
  Info,
  ShoppingCart,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

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
  tags: string[];
  calories: number;
}

interface PizzaCardProps {
  pizza: Pizza;
  index: number;
  onAddToCart: (pizzaId: string) => void;
  onViewDetails: (pizzaId: string) => void;
}

export default function PizzaCard({
  pizza,
  index,
  onAddToCart,
  onViewDetails,
}: PizzaCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group relative overflow-hidden border-0 bg-white transition-all duration-500 hover:shadow-2xl">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Image */}
          <motion.img
            src={pizza.image}
            alt={pizza.name}
            className="h-full w-full object-cover"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />

          {/* Gradient Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
          />

          {/* Top Badges */}
          <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
            {pizza.isSpicy && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <Badge variant="destructive" className="gap-1 shadow-lg">
                  <Flame className="h-3 w-3" />
                  Épicée
                </Badge>
              </motion.div>
            )}
            {pizza.isVegetarian && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="success" className="gap-1 shadow-lg">
                  <Leaf className="h-3 w-3" />
                  Végé
                </Badge>
              </motion.div>
            )}
            {pizza.tags.includes('Populaire') && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="gap-1 border-0 bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
                  <Star className="h-3 w-3 fill-white" />
                  Top
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Favorite Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: isHovered ? 1 : 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </motion.button>

          {/* Quick Actions (Visible on Hover) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: isHovered ? 0 : 20,
              opacity: isHovered ? 1 : 0,
            }}
            className="absolute bottom-4 right-4 z-10 flex gap-2"
          >
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
              onClick={() => onViewDetails(pizza.id)}
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="rounded-full shadow-lg"
              onClick={() => onAddToCart(pizza.id)}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Preparation Time Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: isHovered ? 0 : 20,
              opacity: isHovered ? 1 : 0,
            }}
            className="absolute bottom-4 left-4 z-10"
          >
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-900">
                {pizza.preparationTime} min
              </span>
            </div>
          </motion.div>
        </div>

        <CardContent className="p-6">
          {/* Category Tags */}
          <div className="mb-3 flex flex-wrap gap-2">
            {pizza.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
            {pizza.name}
          </h3>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
            {pizza.description}
          </p>

          {/* Rating & Calories */}
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-semibold text-gray-900">
                  {pizza.rating}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({pizza.reviewCount})
              </span>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {pizza.calories} cal
            </span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs text-gray-500">À partir de</p>
              <p className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-2xl font-bold text-transparent">
                {formatPrice(pizza.basePrice)}
              </p>
            </div>
            <Button
              size="lg"
              className="group/btn"
              onClick={() => onAddToCart(pizza.id)}
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover/btn:rotate-90" />
              Ajouter
            </Button>
          </div>
        </CardContent>

        {/* Hover Border Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-orange-500"
        />
      </Card>
    </motion.div>
  );
}
