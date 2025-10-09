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
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Image */}
          <motion.img
            src={pizza.image}
            alt={pizza.name}
            className="w-full h-full object-cover"
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
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {pizza.isSpicy && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <Badge variant="destructive" className="gap-1 shadow-lg">
                  <Flame className="w-3 h-3" />
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
                  <Leaf className="w-3 h-3" />
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
                <Badge className="gap-1 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                  <Star className="w-3 h-3 fill-white" />
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
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center z-10 hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
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
            className="absolute bottom-4 right-4 flex gap-2 z-10"
          >
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white"
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
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-900">
                {pizza.preparationTime} min
              </span>
            </div>
          </motion.div>
        </div>

        <CardContent className="p-6">
          {/* Category Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {pizza.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
            {pizza.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {pizza.description}
          </p>

          {/* Rating & Calories */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-semibold text-gray-900">
                  {pizza.rating}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({pizza.reviewCount})
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {pizza.calories} cal
            </span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">À partir de</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                {formatPrice(pizza.basePrice)}
              </p>
            </div>
            <Button
              size="lg"
              className="group/btn"
              onClick={() => onAddToCart(pizza.id)}
            >
              <Plus className="mr-2 h-5 w-5 group-hover/btn:rotate-90 transition-transform" />
              Ajouter
            </Button>
          </div>
        </CardContent>

        {/* Hover Border Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 rounded-2xl border-2 border-orange-500 pointer-events-none"
        />
      </Card>
    </motion.div>
  );
}
