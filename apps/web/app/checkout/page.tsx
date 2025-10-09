'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  MapPin,
  CreditCard,
  Clock,
  Check,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Livraison', icon: MapPin },
  { id: 2, name: 'Paiement', icon: CreditCard },
  { id: 3, name: 'Confirmation', icon: Check },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'mobile'>('card');

  // Mock cart data
  const cartItems = [
    {
      id: '1',
      name: 'Margherita Royale',
      size: 'Grande',
      quantity: 2,
      price: 12000,
    },
    {
      id: '2',
      name: 'BBQ Chicken',
      size: 'Moyenne',
      quantity: 1,
      price: 12500,
    },
  ];

  const subtotal = 36500;
  const deliveryFee = 0;
  const tax = 6570;
  const total = 43070;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative z-10">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: currentStep === step.id ? 1.1 : 1,
                    }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    <step.icon className="w-7 h-7" />
                  </motion.div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-orange-600' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-200 rounded relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: currentStep > step.id ? '100%' : '0%',
                      }}
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Mode de réception
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setDeliveryType('delivery')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          deliveryType === 'delivery'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <MapPin
                          className={`w-8 h-8 mx-auto mb-3 ${
                            deliveryType === 'delivery'
                              ? 'text-orange-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <p className="font-semibold text-gray-900">Livraison</p>
                        <p className="text-sm text-gray-500 mt-1">30 min</p>
                      </button>

                      <button
                        onClick={() => setDeliveryType('pickup')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          deliveryType === 'pickup'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <ShoppingBag
                          className={`w-8 h-8 mx-auto mb-3 ${
                            deliveryType === 'pickup'
                              ? 'text-orange-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <p className="font-semibold text-gray-900">
                          À emporter
                        </p>
                        <p className="text-sm text-gray-500 mt-1">15 min</p>
                      </button>
                    </div>

                    {deliveryType === 'delivery' && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Adresse de livraison
                        </h3>
                        <input
                          type="text"
                          placeholder="Rue, quartier"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Ville"
                            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Code postal"
                            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          />
                        </div>
                        <textarea
                          placeholder="Instructions de livraison (optionnel)"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Heure de livraison
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full p-4 rounded-xl border-2 border-orange-500 bg-orange-50 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                Dès que possible
                              </p>
                              <p className="text-sm text-gray-500">~30 min</p>
                            </div>
                          </div>
                          <Badge>Recommandé</Badge>
                        </div>
                      </button>
                      <button className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 text-left transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                Programmer
                              </p>
                              <p className="text-sm text-gray-500">
                                Choisir une heure
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setCurrentStep(2)}
                >
                  Continuer vers le paiement
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Mode de paiement
                    </h2>

                    <div className="space-y-3 mb-6">
                      {[
                        { id: 'card', name: 'Carte bancaire', icon: '💳' },
                        { id: 'mobile', name: 'Mobile Money', icon: '📱' },
                        { id: 'cash', name: 'Espèces à la livraison', icon: '💵' },
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                            paymentMethod === method.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{method.icon}</span>
                            <span className="font-semibold text-gray-900">
                              {method.name}
                            </span>
                          </div>
                          {paymentMethod === method.id && (
                            <Check className="w-5 h-5 text-orange-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Numéro de carte"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="MM/AA"
                            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep(1)}
                  >
                    Retour
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => setCurrentStep(3)}
                  >
                    Passer la commande
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Commande confirmée ! 🎉
                </h2>
                <p className="text-gray-600 mb-2">
                  Numéro de commande: <strong>#PK20251007001</strong>
                </p>
                <p className="text-gray-600 mb-8">
                  Votre pizza arrive dans environ <strong>30 minutes</strong>
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">Suivre ma commande</Button>
                  <Button size="lg" variant="outline">
                    Retour à l'accueil
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Récapitulatif
                </h3>

                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-gray-500 text-xs">{item.size}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-4 border-t border-gray-100">
                  <div className="flex justify-between text-gray-700">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Livraison</span>
                    <span className="text-green-600 font-medium">Gratuit</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>TVA</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
