'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import {
  Search,
  SlidersHorizontal,
  ArrowUp,
  Plus,
  Star,
  Clock,
  Flame,
  Leaf,
  ChefHat,
  Pizza as PizzaIcon,
  Beef,
  Milk,
  X,
  ShoppingCart
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getPizzaSizeVariants, resolvePizzaVariant } from '@/lib/pizzaPricing';

// Données enrichies avec catégories et disponibilité
const allPizzas = [
  // SIGNATURES
  {
    id: 's1',
    name: 'BBQ Chicken Supreme',
    description: 'Poulet mariné BBQ, oignons rouges, bacon, coriandre fraîche, sauce BBQ fumée maison',
    basePrice: 9500,
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=800&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 298,
    preparationTime: 18,
    isSpicy: false,
    isVegetarian: false,
    category: 'signatures',
    tags: ['Signature', 'Populaire'],
    available: true,
  },
  {
    id: 's2',
    name: 'Fruits de Mer Premium',
    description: 'Crevettes roses, calamars, moules, ail, persil, citron, huile d\'olive',
    basePrice: 11500,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&h=800&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 156,
    preparationTime: 20,
    isSpicy: false,
    isVegetarian: false,
    category: 'signatures',
    tags: ['Signature', 'Premium'],
    available: true,
  },
  {
    id: 's3',
    name: 'Truffe Noire Prestige',
    description: 'Crème de truffe, champignons sauvages, parmesan 36 mois, roquette, copeaux de truffe',
    basePrice: 14500,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=800&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 89,
    preparationTime: 20,
    isSpicy: false,
    isVegetarian: true,
    category: 'signatures',
    tags: ['Signature', 'Luxe'],
    available: false, // Indisponible
  },

  // CLASSIQUES
  {
    id: 'c1',
    name: 'Margherita Royale',
    description: 'Tomate San Marzano, mozzarella di bufala DOP, basilic frais, huile d\'olive extra vierge',
    basePrice: 5500,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=800&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 445,
    preparationTime: 12,
    isSpicy: false,
    isVegetarian: true,
    category: 'classiques',
    tags: ['Classique', 'Populaire'],
    available: true,
  },
  {
    id: 'c2',
    name: 'Reine Royale',
    description: 'Jambon blanc premium, champignons de Paris frais, mozzarella, sauce béchamel',
    basePrice: 7500,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=800&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 389,
    preparationTime: 15,
    isSpicy: false,
    isVegetarian: false,
    category: 'classiques',
    tags: ['Classique'],
    available: true,
  },

  // VÉGÉTARIENNES
  {
    id: 'v1',
    name: 'Végétarienne Deluxe',
    description: 'Poivrons grillés, champignons, oignons, tomates cerises, olives, aubergines, mozzarella',
    basePrice: 7000,
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=800&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 267,
    preparationTime: 16,
    isSpicy: false,
    isVegetarian: true,
    category: 'vegetariennes',
    tags: ['Végétarienne', 'Healthy'],
    available: true,
  },
  {
    id: 'v2',
    name: 'Caprese Fraîcheur',
    description: 'Tomates fraîches, mozzarella burrata, basilic, roquette, vinaigre balsamique',
    basePrice: 8000,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop&q=80',
    rating: 4.6,
    reviewCount: 178,
    preparationTime: 14,
    isSpicy: false,
    isVegetarian: true,
    category: 'vegetariennes',
    tags: ['Végétarienne', 'Léger'],
    available: false, // Indisponible
  },

  // VIANDES ET POULET
  {
    id: 'vp1',
    name: 'Pepperoni Suprême',
    description: 'Triple pepperoni premium, mozzarella généreuse, sauce tomate maison, origan',
    basePrice: 7500,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=800&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 512,
    preparationTime: 15,
    isSpicy: false,
    isVegetarian: false,
    category: 'viandes',
    tags: ['Viande', 'Best Seller'],
    available: true,
  },
  {
    id: 'vp2',
    name: 'Diavola Infernale',
    description: 'Salami piquant, jalapeños, piments calabrais, huile pimentée, mozzarella fumée',
    basePrice: 8000,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=800&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 234,
    preparationTime: 16,
    isSpicy: true,
    isVegetarian: false,
    category: 'viandes',
    tags: ['Viande', 'Épicée'],
    available: true,
  },
  {
    id: 'vp3',
    name: 'Mexicaine Explosive',
    description: 'Bœuf haché épicé, haricots rouges, jalapeños, cheddar, crème aigre, nachos',
    basePrice: 8500,
    image: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=800&h=800&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 198,
    preparationTime: 18,
    isSpicy: true,
    isVegetarian: false,
    category: 'viandes',
    tags: ['Viande', 'Épicée'],
    available: false, // Indisponible
  },

  // FROMAGES
  {
    id: 'f1',
    name: 'Quatre Fromages',
    description: 'Mozzarella, gorgonzola doux, parmesan reggiano, emmental, crème fraîche',
    basePrice: 8500,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=800&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 367,
    preparationTime: 16,
    isSpicy: false,
    isVegetarian: true,
    category: 'fromages',
    tags: ['Fromage', 'Premium'],
    available: true,
  },
  {
    id: 'f2',
    name: 'Chèvre Miel',
    description: 'Fromage de chèvre, miel, noix, roquette, mozzarella, huile de truffe',
    basePrice: 9000,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=800&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 245,
    preparationTime: 17,
    isSpicy: false,
    isVegetarian: true,
    category: 'fromages',
    tags: ['Fromage', 'Gourmand'],
    available: true,
  },
];

const categories = [
  { id: 'all', label: 'Toutes', icon: PizzaIcon },
  { id: 'signatures', label: 'Signatures', icon: ChefHat },
  { id: 'classiques', label: 'Classiques', icon: Star },
  { id: 'vegetariennes', label: 'Végétariennes', icon: Leaf },
  { id: 'viandes', label: 'Viandes & Poulet', icon: Beef },
  { id: 'fromages', label: 'Fromages', icon: Milk },
];

export default function MenuPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterSpicy, setFilterSpicy] = useState(false);
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addItem, openCart } = useCart();

  // Détecter et appliquer la catégorie depuis l'URL
  useEffect(() => {
    if (categoryParam && categories.find(c => c.id === categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  // Filtrage et tri
  const filteredPizzas = useMemo(() => {
    let result = [...allPizzas];

    // Filtre par catégorie
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Filtre par recherche
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtres rapides
    if (filterSpicy) {
      result = result.filter(p => p.isSpicy);
    }
    if (filterVegetarian) {
      result = result.filter(p => p.isVegetarian);
    }

    // Tri
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [activeCategory, searchQuery, sortBy, filterSpicy, filterVegetarian]);

  // Gestion scroll
  if (typeof window !== 'undefined') {
    window.onscroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (pizzaId: string, shouldOpenCart: boolean = false) => {
    const pizza = allPizzas.find(p => p.id === pizzaId);
    if (!pizza) {
      return;
    }

    const variants = getPizzaSizeVariants(pizza.basePrice);
    const defaultVariant = resolvePizzaVariant(variants);

    addItem(
      {
        productId: pizza.id,
        name: pizza.name,
        image: pizza.image,
        description: pizza.description,
        price: defaultVariant.price,
        sizeId: defaultVariant.id,
        sizeLabel: defaultVariant.label,
        priceVariants: variants,
        category: 'pizza',
        metadata: {
          Préparation: `${pizza.preparationTime} min`,
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
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Compact et Élégant */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-8 sm:py-12 lg:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6"
            >
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-2">Notre Menu</h1>
                <p className="text-gray-300 text-xs sm:text-sm lg:text-base">
                  {allPizzas.length} pizzas artisanales • Préparation en {' '}
                  <span className="text-orange-400 font-bold">12-20 min</span>
                </p>
              </div>

              {/* Search Bar Intégré */}
              <div className="w-full lg:w-96">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une pizza..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content - Layout 2 colonnes */}
      <section className="py-4 sm:py-6 lg:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Sidebar Fixe - Gauche */}
              <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="lg:sticky lg:top-24 space-y-3 sm:space-y-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-sm shadow-md active:scale-95 transition-transform"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filtres & Catégories
                    </span>
                    {sidebarOpen ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
                  </button>

                  {/* Filters Container */}
                  <div className={`space-y-3 sm:space-y-4 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                    {/* Categories */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                      <h3 className="font-black text-xs sm:text-sm uppercase tracking-wide text-gray-900 mb-2 sm:mb-3">Catégories</h3>
                      <div className="space-y-1.5">
                        {categories.map((cat) => {
                          const Icon = cat.icon;
                          const isActive = activeCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setActiveCategory(cat.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                                isActive
                                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                              <span className="text-sm font-semibold">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                      <h3 className="font-black text-xs sm:text-sm uppercase tracking-wide text-gray-900 mb-2 sm:mb-3">Filtres</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setFilterSpicy(!filterSpicy)}
                          className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                            filterSpicy
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Flame className="w-4 h-4" />
                          <span>Épicées</span>
                        </button>
                        <button
                          onClick={() => setFilterVegetarian(!filterVegetarian)}
                          className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                            filterVegetarian
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Leaf className="w-4 h-4" />
                          <span>Végétariennes</span>
                        </button>
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                      <h3 className="font-black text-xs sm:text-sm uppercase tracking-wide text-gray-900 mb-2 sm:mb-3">Trier par</h3>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none"
                      >
                        <option value="popular">Popularité</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                        <option value="rating">Meilleure note</option>
                      </select>
                    </div>

                    {/* Reset Filters */}
                    {(activeCategory !== 'all' || filterSpicy || filterVegetarian || searchQuery) && (
                      <button
                        onClick={() => {
                          setActiveCategory('all');
                          setFilterSpicy(false);
                          setFilterVegetarian(false);
                          setSearchQuery('');
                        }}
                        className="w-full px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              </aside>

              {/* Main Content - Droite */}
              <div className="flex-1 min-w-0">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">
                      {filteredPizzas.length} résultat{filteredPizzas.length > 1 ? 's' : ''}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {activeCategory === 'all' ? 'Toutes les pizzas' : categories.find(c => c.id === activeCategory)?.label}
                    </p>
                  </div>
                </div>

                {/* Pizza Grid - Compact et Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                  {filteredPizzas.map((pizza, index) => (
                    <motion.div
                      key={pizza.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.4 }}
                      className="h-full"
                    >
                      <Card className={`group relative overflow-hidden border h-full transition-all duration-300 flex flex-col ${
                        pizza.available
                          ? 'border-gray-200 hover:border-orange-300 hover:shadow-lg bg-white'
                          : 'border-red-200 bg-white opacity-90'
                      }`}>
                        {/* Unavailable Badge - Top overlay sans masquer le contenu */}
                        {!pizza.available && (
                          <div className="absolute top-0 left-0 right-0 z-20 bg-red-600 py-1.5 px-3">
                            <p className="text-white font-bold text-xs text-center">
                              ⚠️ Temporairement Indisponible
                            </p>
                          </div>
                        )}

                        {/* Image - Plus compact */}
                        <div className="relative aspect-[4/3] sm:aspect-[5/4] overflow-hidden bg-gray-100">
                          <motion.img
                            whileHover={pizza.available ? { scale: 1.05 } : {}}
                            transition={{ duration: 0.4 }}
                            src={pizza.image}
                            alt={pizza.name}
                            className="w-full h-full object-cover"
                          />

                          {/* Badges Compact */}
                          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex gap-1.5 z-10">
                            {pizza.isSpicy && (
                              <Badge className="bg-red-600 text-white gap-1 text-[10px] font-bold px-2 py-0.5">
                                <Flame className="w-3 h-3" />
                              </Badge>
                            )}
                            {pizza.isVegetarian && (
                              <Badge className="bg-green-600 text-white gap-1 text-[10px] font-bold px-2 py-0.5">
                                <Leaf className="w-3 h-3" />
                              </Badge>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1 shadow-md z-10">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-xs">{pizza.rating}</span>
                          </div>
                        </div>

                        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                          {/* Name */}
                          <h3 className="text-sm sm:text-base font-black text-gray-900 mb-1 sm:mb-1.5 line-clamp-1">
                            {pizza.name}
                          </h3>

                          {/* Description */}
                          <p className="text-[11px] sm:text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
                            {pizza.description}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center text-[10px] text-gray-500 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-100">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="font-semibold">{pizza.preparationTime}min</span>
                            <span className="mx-1.5 sm:mx-2">•</span>
                            <span className="font-semibold">{pizza.reviewCount} avis</span>
                          </div>

                          {/* Price & Buttons */}
                          <div className="mt-auto">
                            <div className="mb-2 sm:mb-3">
                              <p className="text-[9px] text-gray-500 font-semibold uppercase mb-0.5">À partir de</p>
                              <p className="text-lg sm:text-xl font-black text-gray-900">
                                {formatPrice(pizza.basePrice)}
                              </p>
                            </div>
                            {pizza.available ? (
                              <div className="flex gap-1.5 sm:gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleAddToCart(pizza.id, false)}
                                  className="flex-1 bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  <span className="text-[11px] sm:text-xs">Ajouter</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleAddToCart(pizza.id, true)}
                                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 shadow-md transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  <span className="text-[11px] sm:text-xs">Commander</span>
                                </motion.button>
                              </div>
                            ) : (
                              <button disabled className="w-full bg-gray-200 text-gray-400 font-bold rounded-lg px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs cursor-not-allowed">
                                Indisponible
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* No Results */}
                {filteredPizzas.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white rounded-xl border border-gray-200"
                  >
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Aucun résultat</h3>
                    <p className="text-gray-600 text-sm mb-6">Essayez de modifier vos critères de recherche</p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                        setFilterSpicy(false);
                        setFilterVegetarian(false);
                      }}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-6 py-2 rounded-lg text-sm"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </motion.div>
                )}

                {/* CTA Section - Transition élégante */}
                {filteredPizzas.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 sm:mt-12 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center border border-orange-100"
                  >
                    <div className="max-w-2xl mx-auto">
                      <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">🍕</div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-2 sm:mb-3">
                        Vous n'avez pas trouvé votre bonheur ?
                      </h2>
                      <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm lg:text-base">
                        Découvrez nos offres spéciales et menus personnalisés.
                        Profitez de -20% sur votre première commande avec le code{' '}
                        <span className="font-black text-orange-600">PIZZA20</span>
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                        <a href="/offres" className="w-full sm:w-auto">
                          <Button className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg shadow-lg text-sm">
                            Voir les offres spéciales
                          </Button>
                        </a>
                        <a href="/custom-pizza" className="w-full sm:w-auto">
                          <Button variant="outline" className="w-full sm:w-auto border-2 border-gray-300 hover:border-orange-500 font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm">
                            Créer ma pizza
                          </Button>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-50"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
