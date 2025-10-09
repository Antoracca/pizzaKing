'use client';

import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Flame, Leaf, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  { id: 'all', name: 'Toutes', icon: Star, count: 24 },
  { id: 'signature', name: 'Signature', icon: Star, count: 6 },
  { id: 'classique', name: 'Classiques', icon: null, count: 8 },
  { id: 'vegetarienne', name: 'Végétariennes', icon: Leaf, count: 5 },
  { id: 'viande', name: 'Viandes', icon: null, count: 7 },
  { id: 'fromage', name: 'Fromages', icon: null, count: 4 },
];

const filters = [
  { id: 'spicy', name: 'Épicée', icon: Flame, color: 'text-red-500' },
  { id: 'vegetarian', name: 'Végétarien', icon: Leaf, color: 'text-green-500' },
  { id: 'popular', name: 'Populaire', icon: Star, color: 'text-yellow-500' },
];

interface MenuFiltersProps {
  activeCategory: string;
  activeFilters: string[];
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onFilterToggle: (filter: string) => void;
  onSearchChange: (query: string) => void;
}

export default function MenuFilters({
  activeCategory,
  activeFilters,
  searchQuery,
  onCategoryChange,
  onFilterToggle,
  onSearchChange,
}: MenuFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une pizza..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-lg"
        />
      </motion.div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Catégories</h3>
          <Button variant="ghost" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {category.icon && (
                  <category.icon
                    className={`h-4 w-4 ${
                      activeCategory === category.id
                        ? 'text-white'
                        : 'text-orange-500'
                    }`}
                  />
                )}
                <span>{category.name}</span>
                <Badge
                  variant={activeCategory === category.id ? 'secondary' : 'outline'}
                  className={`ml-1 ${
                    activeCategory === category.id
                      ? 'bg-white/20 text-white border-white/30'
                      : ''
                  }`}
                >
                  {category.count}
                </Badge>
              </div>

              {/* Active Indicator */}
              {activeCategory === category.id && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Filtres Rapides
        </h3>
        <div className="flex flex-wrap gap-3">
          {filters.map((filter, index) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <motion.button
                key={filter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onFilterToggle(filter.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-900'
                }`}
              >
                <filter.icon
                  className={`h-4 w-4 ${isActive ? 'text-white' : filter.color}`}
                />
                <span>{filter.name}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(activeFilters.length > 0 || searchQuery) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 p-4 bg-orange-50 rounded-xl border border-orange-100"
        >
          <span className="text-sm font-medium text-orange-900">
            Filtres actifs:
          </span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="bg-white">
                Recherche: "{searchQuery}"
              </Badge>
            )}
            {activeFilters.map(filterId => {
              const filter = filters.find(f => f.id === filterId);
              return (
                <Badge key={filterId} variant="secondary" className="bg-white">
                  {filter?.name}
                </Badge>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              activeFilters.forEach(f => onFilterToggle(f));
            }}
            className="ml-auto text-orange-600 hover:text-orange-700"
          >
            Réinitialiser
          </Button>
        </motion.div>
      )}
    </div>
  );
}
