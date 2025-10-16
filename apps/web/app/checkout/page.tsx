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
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(
    'delivery'
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'card' | 'cash' | 'mobile'
  >('card');

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
        <div className="mx-auto mb-12 max-w-3xl">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: currentStep === step.id ? 1.1 : 1,
                    }}
                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'border-2 border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    <step.icon className="h-7 w-7" />
                  </motion.div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.id
                        ? 'text-orange-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="relative mx-4 h-1 flex-1 rounded bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: currentStep > step.id ? '100%' : '0%',
                      }}
                      className="h-full rounded bg-gradient-to-r from-orange-500 to-orange-600"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
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
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                      Mode de réception
                    </h2>

                    <div className="mb-6 grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setDeliveryType('delivery')}
                        className={`rounded-2xl border-2 p-6 transition-all ${
                          deliveryType === 'delivery'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <MapPin
                          className={`mx-auto mb-3 h-8 w-8 ${
                            deliveryType === 'delivery'
                              ? 'text-orange-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <p className="font-semibold text-gray-900">Livraison</p>
                        <p className="mt-1 text-sm text-gray-500">30 min</p>
                      </button>

                      <button
                        onClick={() => setDeliveryType('pickup')}
                        className={`rounded-2xl border-2 p-6 transition-all ${
                          deliveryType === 'pickup'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <ShoppingBag
                          className={`mx-auto mb-3 h-8 w-8 ${
                            deliveryType === 'pickup'
                              ? 'text-orange-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <p className="font-semibold text-gray-900">
                          À emporter
                        </p>
                        <p className="mt-1 text-sm text-gray-500">15 min</p>
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
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Ville"
                            className="rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                          />
                          <input
                            type="text"
                            placeholder="Code postal"
                            className="rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                          />
                        </div>
                        <textarea
                          placeholder="Instructions de livraison (optionnel)"
                          rows={3}
                          className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-semibold text-gray-900">
                      Heure de livraison
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full rounded-xl border-2 border-orange-500 bg-orange-50 p-4 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-orange-600" />
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
                      <button className="w-full rounded-xl border-2 border-gray-200 p-4 text-left transition-colors hover:border-orange-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                Programmer
                              </p>
                              <p className="text-sm text-gray-500">
                                Choisir une heure
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
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
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                      Mode de paiement
                    </h2>

                    <div className="mb-6 space-y-3">
                      {[
                        { id: 'card', name: 'Carte bancaire', icon: '💳' },
                        { id: 'mobile', name: 'Mobile Money', icon: '📱' },
                        {
                          id: 'cash',
                          name: 'Espèces à la livraison',
                          icon: '💵',
                        },
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
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
                            <Check className="h-5 w-5 text-orange-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Numéro de carte"
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="MM/AA"
                            className="rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            className="rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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
                className="py-12 text-center"
              >
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Commande confirmée ! 🎉
                </h2>
                <p className="mb-2 text-gray-600">
                  Numéro de commande: <strong>#PK20251007001</strong>
                </p>
                <p className="mb-8 text-gray-600">
                  Votre pizza arrive dans environ <strong>30 minutes</strong>
                </p>
                <div className="flex justify-center gap-4">
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
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  Récapitulatif
                </h3>

                <div className="mb-6 space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.size}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-gray-100 py-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Livraison</span>
                    <span className="font-medium text-green-600">Gratuit</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>TVA</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">
                      {formatPrice(total)}
                    </span>
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
