'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Minus,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ShoppingCart,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pizza as PizzaIcon
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Tailles de pizza avec prix de base
const pizzaSizes = [
  { id: 'small', name: 'Petite', size: '25cm', price: 4000, servings: '1-2 personnes' },
  { id: 'medium', name: 'Moyenne', size: '30cm', price: 6000, servings: '2-3 personnes', popular: true },
  { id: 'large', name: 'Grande', size: '35cm', price: 8000, servings: '3-4 personnes' },
  { id: 'xlarge', name: 'XL', size: '40cm', price: 10000, servings: '4-5 personnes' },
];

// Types de pâte
const crustTypes = [
  { id: 'classic', name: 'Classique', price: 0, description: 'Pâte traditionnelle moelleuse' },
  { id: 'thin', name: 'Fine', price: 0, description: 'Pâte fine et croustillante' },
  { id: 'thick', name: 'Épaisse', price: 500, description: 'Pâte épaisse et moelleuse' },
  { id: 'stuffed', name: 'Farcie', price: 1500, description: 'Bordure farcie au fromage', premium: true },
];

// Sauces de base
const sauces = [
  { id: 'tomato', name: 'Tomate', price: 0, color: '#D32F2F', icon: '🍅' },
  { id: 'cream', name: 'Crème', price: 0, color: '#FFF8DC', icon: '🥛' },
  { id: 'bbq', name: 'BBQ', price: 300, color: '#8B4513', icon: '🍖' },
  { id: 'pesto', name: 'Pesto', price: 500, color: '#2E7D32', icon: '🌿' },
];

// Fromages
const cheeses = [
  { id: 'mozzarella', name: 'Mozzarella', price: 0, color: '#FFFACD' },
  { id: 'cheddar', name: 'Cheddar', price: 500, color: '#FFA500' },
  { id: 'parmesan', name: 'Parmesan', price: 500, color: '#F5DEB3' },
  { id: 'goat', name: 'Chèvre', price: 700, color: '#F0E68C', premium: true },
];

// Garnitures (groupées par catégorie)
const toppings = {
  meats: [
    { id: 'pepperoni', name: 'Pepperoni', price: 800, icon: '🍕', color: '#DC143C' },
    { id: 'ham', name: 'Jambon', price: 700, icon: '🥓', color: '#FFB6C1' },
    { id: 'bacon', name: 'Bacon', price: 800, icon: '🥓', color: '#CD853F' },
    { id: 'chicken', name: 'Poulet', price: 900, icon: '🍗', color: '#F4A460' },
    { id: 'beef', name: 'Bœuf haché', price: 900, icon: '🥩', color: '#8B4513' },
    { id: 'sausage', name: 'Saucisse', price: 800, icon: '🌭', color: '#A0522D' },
  ],
  veggies: [
    { id: 'mushroom', name: 'Champignons', price: 400, icon: '🍄', color: '#D2B48C' },
    { id: 'onion', name: 'Oignons', price: 300, icon: '🧅', color: '#DDA0DD' },
    { id: 'pepper', name: 'Poivrons', price: 400, icon: '🫑', color: '#32CD32' },
    { id: 'tomato', name: 'Tomates', price: 300, icon: '🍅', color: '#FF6347' },
    { id: 'olive', name: 'Olives', price: 500, icon: '🫒', color: '#556B2F' },
    { id: 'corn', name: 'Maïs', price: 400, icon: '🌽', color: '#FFD700' },
    { id: 'spinach', name: 'Épinards', price: 500, icon: '🥬', color: '#228B22' },
  ],
  premium: [
    { id: 'shrimp', name: 'Crevettes', price: 1500, icon: '🦐', color: '#FFA07A', premium: true },
    { id: 'truffle', name: 'Truffe', price: 2000, icon: '🍄', color: '#2F4F4F', premium: true },
    { id: 'salmon', name: 'Saumon', price: 1800, icon: '🐟', color: '#FA8072', premium: true },
  ]
};

export default function CustomPizzaPage() {
  // États pour la construction de la pizza
  const [step, setStep] = useState(1); // 1: Taille, 2: Pâte, 3: Base, 4: Garnitures, 5: Validation
  const [selectedSize, setSelectedSize] = useState(pizzaSizes[1]); // Moyenne par défaut
  const [selectedCrust, setSelectedCrust] = useState(crustTypes[0]);
  const [selectedSauce, setSelectedSauce] = useState(sauces[0]);
  const [selectedCheese, setSelectedCheese] = useState(cheeses[0]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  // États pour l'interaction 3D
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  // États pour la validation
  const [isValidating, setIsValidating] = useState(false);
  const [preparationProgress, setPreparationProgress] = useState(0);

  // Calcul du prix total en temps réel
  const totalPrice =
    selectedSize.price +
    selectedCrust.price +
    selectedSauce.price +
    selectedCheese.price +
    selectedToppings.reduce((sum, id) => {
      const topping = [...toppings.meats, ...toppings.veggies, ...toppings.premium].find(t => t.id === id);
      return sum + (topping?.price || 0);
    }, 0);

  // Gestion des garnitures
  const toggleTopping = (id: string) => {
    if (selectedToppings.includes(id)) {
      setSelectedToppings(selectedToppings.filter(t => t !== id));
    } else {
      if (selectedToppings.length < 8) { // Maximum 8 garnitures
        setSelectedToppings([...selectedToppings, id]);
      }
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Animation de rotation automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 lg:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="text-6xl mb-6">🍕</div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4">
              Créez Votre Pizza Parfaite
            </h1>
            <p className="text-lg lg:text-xl text-gray-300">
              Personnalisez chaque détail et regardez votre création prendre vie en 3D
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Builder */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

              {/* Colonne Gauche - Visualisation 3D */}
              <div className="order-2 lg:order-1">
                <div className="sticky top-24">
                  <Card className="border-2 overflow-hidden">
                    <CardContent className="p-6">
                      {/* Aperçu 3D de la pizza */}
                      <div className="relative aspect-square bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl overflow-hidden mb-6">
                        {/* Pizza 3D simulée */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotate: rotation }}
                          style={{ scale: zoom }}
                        >
                          {/* Base de la pizza */}
                          <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                            {/* Croûte */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 shadow-2xl" />

                            {/* Sauce */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="absolute inset-4 rounded-full shadow-inner"
                              style={{ backgroundColor: selectedSauce.color }}
                            />

                            {/* Fromage */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                              className="absolute inset-8 rounded-full shadow-inner opacity-90"
                              style={{ backgroundColor: selectedCheese.color }}
                            />

                            {/* Garnitures */}
                            <AnimatePresence>
                              {selectedToppings.map((toppingId, index) => {
                                const topping = [...toppings.meats, ...toppings.veggies, ...toppings.premium]
                                  .find(t => t.id === toppingId);
                                if (!topping) return null;

                                // Position aléatoire mais fixe pour chaque garniture
                                const angle = (index * 137.5) % 360; // Golden angle
                                const distance = 30 + (index % 3) * 20;
                                const x = Math.cos(angle * Math.PI / 180) * distance;
                                const y = Math.sin(angle * Math.PI / 180) * distance;

                                return (
                                  <motion.div
                                    key={toppingId}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                      marginLeft: x,
                                      marginTop: y,
                                    }}
                                  >
                                    <div className="text-4xl lg:text-5xl filter drop-shadow-lg">
                                      {topping.icon}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </motion.div>

                        {/* Contrôles de vue */}
                        <div className="absolute top-4 right-4 flex flex-col space-y-2">
                          <button
                            onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white shadow-lg transition-all"
                          >
                            <ZoomIn className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => setZoom(Math.max(zoom - 0.1, 0.8))}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white shadow-lg transition-all"
                          >
                            <ZoomOut className="w-5 h-5 text-gray-700" />
                          </button>
                        </div>

                        {/* Badge de taille */}
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold text-sm">
                            {selectedSize.name} - {selectedSize.size}
                          </Badge>
                        </div>
                      </div>

                      {/* Informations sur la pizza */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-gray-900">Votre Création</h3>
                          <button
                            onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                          >
                            Détails
                          </button>
                        </div>

                        {/* Résumé */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Taille:</span>
                            <span className="font-bold text-gray-900">{selectedSize.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Pâte:</span>
                            <span className="font-bold text-gray-900">{selectedCrust.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Base:</span>
                            <span className="font-bold text-gray-900">{selectedSauce.name} + {selectedCheese.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Garnitures:</span>
                            <span className="font-bold text-gray-900">{selectedToppings.length}/8</span>
                          </div>
                        </div>

                        {/* Détail des prix */}
                        <AnimatePresence>
                          {showPriceBreakdown && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-orange-50 rounded-xl p-4 space-y-2 border border-orange-200"
                            >
                              <p className="font-bold text-sm text-gray-900 mb-2">Détail du prix:</p>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>Taille {selectedSize.name}</span>
                                  <span className="font-semibold">{formatPrice(selectedSize.price)}</span>
                                </div>
                                {selectedCrust.price > 0 && (
                                  <div className="flex justify-between">
                                    <span>Pâte {selectedCrust.name}</span>
                                    <span className="font-semibold">{formatPrice(selectedCrust.price)}</span>
                                  </div>
                                )}
                                {selectedSauce.price > 0 && (
                                  <div className="flex justify-between">
                                    <span>Sauce {selectedSauce.name}</span>
                                    <span className="font-semibold">{formatPrice(selectedSauce.price)}</span>
                                  </div>
                                )}
                                {selectedCheese.price > 0 && (
                                  <div className="flex justify-between">
                                    <span>Fromage {selectedCheese.name}</span>
                                    <span className="font-semibold">{formatPrice(selectedCheese.price)}</span>
                                  </div>
                                )}
                                {selectedToppings.map(id => {
                                  const topping = [...toppings.meats, ...toppings.veggies, ...toppings.premium]
                                    .find(t => t.id === id);
                                  return topping ? (
                                    <div key={id} className="flex justify-between">
                                      <span>{topping.icon} {topping.name}</span>
                                      <span className="font-semibold">{formatPrice(topping.price)}</span>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Prix total et bouton */}
                        <div className="border-t-2 border-gray-200 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm text-gray-500 font-semibold">Prix Total</p>
                              <motion.p
                                key={totalPrice}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-4xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
                              >
                                {formatPrice(totalPrice)}
                              </motion.p>
                            </div>
                          </div>

                          <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black py-6 rounded-xl text-lg shadow-xl">
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Ajouter au Panier
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Colonne Droite - Options de personnalisation */}
              <div className="order-1 lg:order-2">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex-1 flex items-center">
                      <button
                        onClick={() => setStep(s)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
                          step === s
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-110'
                            : step > s
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step > s ? <Check className="w-5 h-5" /> : s}
                      </button>
                      {s < 4 && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
                          step > s ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Étape 1: Taille */}
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Card className="border-2">
                        <CardContent className="p-6">
                          <h2 className="text-2xl font-black text-gray-900 mb-2">
                            1. Choisissez la Taille
                          </h2>
                          <p className="text-gray-600 mb-6">
                            Sélectionnez la taille de votre pizza
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pizzaSizes.map((size) => (
                              <button
                                key={size.id}
                                onClick={() => setSelectedSize(size)}
                                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                                  selectedSize.id === size.id
                                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                                    : 'border-gray-200 hover:border-orange-300'
                                }`}
                              >
                                {size.popular && (
                                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black">
                                    Populaire
                                  </Badge>
                                )}
                                <div className="text-3xl mb-2">🍕</div>
                                <h3 className="font-black text-gray-900 text-lg mb-1">
                                  {size.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  {size.size} • {size.servings}
                                </p>
                                <p className="text-xl font-black text-orange-600">
                                  {formatPrice(size.price)}
                                </p>
                              </button>
                            ))}
                          </div>

                          <div className="mt-6 flex justify-end">
                            <Button
                              onClick={nextStep}
                              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-8 py-3 rounded-lg"
                            >
                              Continuer
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Étape 2: Pâte */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Card className="border-2">
                        <CardContent className="p-6">
                          <h2 className="text-2xl font-black text-gray-900 mb-2">
                            2. Type de Pâte
                          </h2>
                          <p className="text-gray-600 mb-6">
                            Choisissez votre pâte préférée
                          </p>

                          <div className="space-y-3">
                            {crustTypes.map((crust) => (
                              <button
                                key={crust.id}
                                onClick={() => setSelectedCrust(crust)}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start space-x-4 ${
                                  selectedCrust.id === crust.id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-300'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                                  selectedCrust.id === crust.id
                                    ? 'border-orange-500 bg-orange-500'
                                    : 'border-gray-300'
                                }`}>
                                  {selectedCrust.id === crust.id && (
                                    <Check className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-black text-gray-900">{crust.name}</h3>
                                    {crust.premium && (
                                      <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{crust.description}</p>
                                </div>
                                <p className="font-black text-orange-600">
                                  {crust.price > 0 ? `+${formatPrice(crust.price)}` : 'Inclus'}
                                </p>
                              </button>
                            ))}
                          </div>

                          <div className="mt-6 flex justify-between">
                            <Button
                              onClick={prevStep}
                              variant="outline"
                              className="border-2 font-bold px-8 py-3 rounded-lg"
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Retour
                            </Button>
                            <Button
                              onClick={nextStep}
                              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-8 py-3 rounded-lg"
                            >
                              Continuer
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Étape 3: Base (Sauce + Fromage) */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Card className="border-2">
                        <CardContent className="p-6">
                          <h2 className="text-2xl font-black text-gray-900 mb-2">
                            3. Base de la Pizza
                          </h2>
                          <p className="text-gray-600 mb-6">
                            Sauce et fromage
                          </p>

                          {/* Sauces */}
                          <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">Sauce</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {sauces.map((sauce) => (
                                <button
                                  key={sauce.id}
                                  onClick={() => setSelectedSauce(sauce)}
                                  className={`p-4 rounded-xl border-2 transition-all ${
                                    selectedSauce.id === sauce.id
                                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                                      : 'border-gray-200 hover:border-orange-300'
                                  }`}
                                >
                                  <div className="text-3xl mb-2">{sauce.icon}</div>
                                  <p className="font-bold text-sm text-gray-900 mb-1">
                                    {sauce.name}
                                  </p>
                                  <p className="text-xs font-semibold text-orange-600">
                                    {sauce.price > 0 ? `+${formatPrice(sauce.price)}` : 'Inclus'}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Fromages */}
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3">Fromage</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {cheeses.map((cheese) => (
                                <button
                                  key={cheese.id}
                                  onClick={() => setSelectedCheese(cheese)}
                                  className={`p-4 rounded-xl border-2 transition-all ${
                                    selectedCheese.id === cheese.id
                                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                                      : 'border-gray-200 hover:border-orange-300'
                                  }`}
                                >
                                  <div
                                    className="w-12 h-12 rounded-full mx-auto mb-2"
                                    style={{ backgroundColor: cheese.color }}
                                  />
                                  <p className="font-bold text-sm text-gray-900 mb-1">
                                    {cheese.name}
                                  </p>
                                  {cheese.premium && (
                                    <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500 mx-auto mb-1" />
                                  )}
                                  <p className="text-xs font-semibold text-orange-600">
                                    {cheese.price > 0 ? `+${formatPrice(cheese.price)}` : 'Inclus'}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex justify-between">
                            <Button
                              onClick={prevStep}
                              variant="outline"
                              className="border-2 font-bold px-8 py-3 rounded-lg"
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Retour
                            </Button>
                            <Button
                              onClick={nextStep}
                              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-8 py-3 rounded-lg"
                            >
                              Continuer
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Étape 4: Garnitures */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Card className="border-2">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-black text-gray-900">
                              4. Garnitures
                            </h2>
                            <Badge className="bg-orange-100 text-orange-700 font-bold">
                              {selectedToppings.length}/8
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-6">
                            Maximum 8 garnitures
                          </p>

                          {/* Viandes */}
                          <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                              <span className="mr-2">🍖</span>
                              Viandes
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {toppings.meats.map((topping) => (
                                <button
                                  key={topping.id}
                                  onClick={() => toggleTopping(topping.id)}
                                  disabled={!selectedToppings.includes(topping.id) && selectedToppings.length >= 8}
                                  className={`p-3 rounded-xl border-2 transition-all ${
                                    selectedToppings.includes(topping.id)
                                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                                      : 'border-gray-200 hover:border-orange-300'
                                  } ${!selectedToppings.includes(topping.id) && selectedToppings.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <div className="text-2xl mb-1">{topping.icon}</div>
                                  <p className="font-bold text-xs text-gray-900 mb-1">
                                    {topping.name}
                                  </p>
                                  <p className="text-xs font-semibold text-orange-600">
                                    +{formatPrice(topping.price)}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Légumes */}
                          <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                              <span className="mr-2">🥗</span>
                              Légumes
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {toppings.veggies.map((topping) => (
                                <button
                                  key={topping.id}
                                  onClick={() => toggleTopping(topping.id)}
                                  disabled={!selectedToppings.includes(topping.id) && selectedToppings.length >= 8}
                                  className={`p-3 rounded-xl border-2 transition-all ${
                                    selectedToppings.includes(topping.id)
                                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                                      : 'border-gray-200 hover:border-orange-300'
                                  } ${!selectedToppings.includes(topping.id) && selectedToppings.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <div className="text-2xl mb-1">{topping.icon}</div>
                                  <p className="font-bold text-xs text-gray-900 mb-1">
                                    {topping.name}
                                  </p>
                                  <p className="text-xs font-semibold text-orange-600">
                                    +{formatPrice(topping.price)}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Premium */}
                          <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                              <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-2" />
                              Premium
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {toppings.premium.map((topping) => (
                                <button
                                  key={topping.id}
                                  onClick={() => toggleTopping(topping.id)}
                                  disabled={!selectedToppings.includes(topping.id) && selectedToppings.length >= 8}
                                  className={`p-3 rounded-xl border-2 transition-all ${
                                    selectedToppings.includes(topping.id)
                                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                                      : 'border-gray-200 hover:border-orange-300'
                                  } ${!selectedToppings.includes(topping.id) && selectedToppings.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <div className="text-2xl mb-1">{topping.icon}</div>
                                  <p className="font-bold text-xs text-gray-900 mb-1">
                                    {topping.name}
                                  </p>
                                  <p className="text-xs font-semibold text-orange-600">
                                    +{formatPrice(topping.price)}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex justify-between">
                            <Button
                              onClick={prevStep}
                              variant="outline"
                              className="border-2 font-bold px-8 py-3 rounded-lg"
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Retour
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
