'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Tag, Truck } from 'lucide-react';
import type { CartItem } from '@/providers/CartProvider';
import { DELIVERY_CONFIG } from '@/lib/config';

const FREE_DELIVERY_THRESHOLD = DELIVERY_CONFIG.FREE_THRESHOLD;
const DELIVERY_FEE = DELIVERY_CONFIG.FEE;

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  isDelivery: boolean;
  promoCode?: {
    code: string;
    discount: number;
  };
}

export default function OrderSummary({
  items,
  subtotal,
  isDelivery,
  promoCode,
}: OrderSummaryProps) {
  const deliveryFee = useMemo(() => {
    if (!isDelivery) return 0;
    if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
    return DELIVERY_FEE;
  }, [isDelivery, subtotal]);

  const discountAmount = promoCode?.discount ?? 0;
  const total = subtotal + deliveryFee - discountAmount;

  const amountToFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;
  const showFreeDeliveryProgress = isDelivery && amountToFreeDelivery > 0;

  return (
    <Card className="sticky top-24 mb-24">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Récapitulatif</h3>
          <Badge variant="secondary" className="gap-1">
            <ShoppingBag className="h-3 w-3" />
            {items.reduce((acc, item) => acc + item.quantity, 0)} articles
          </Badge>
        </div>

        {/* Cart Items */}
        <div className="mb-6 max-h-[400px] space-y-4 overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <ShoppingBag className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p className="text-sm">Votre panier est vide</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.uid}
                className="flex gap-3 rounded-xl bg-gray-50 p-3"
              >
                {item.image && (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {item.name}
                      </p>
                      {item.sizeLabel && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.sizeLabel}
                        </p>
                      )}
                      {item.crustLabel && (
                        <p className="text-xs text-gray-500">
                          {item.crustLabel}
                        </p>
                      )}
                      {item.extras && item.extras.length > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          +{item.extras.length} extra
                          {item.extras.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {item.quantity}x {formatPrice(item.unitPrice)}
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Free Delivery Progress */}
        {showFreeDeliveryProgress && (
          <div className="mb-6 rounded-xl bg-orange-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-orange-900">
                Livraison gratuite
              </span>
              <span className="font-bold text-orange-600">
                {formatPrice(amountToFreeDelivery)} restant
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-orange-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{
                  width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-orange-700">
              Ajoutez {formatPrice(amountToFreeDelivery)} pour bénéficier de la
              livraison gratuite !
            </p>
          </div>
        )}

        {/* Promo Code */}
        {promoCode && (
          <div className="mb-6 flex items-center justify-between rounded-xl border-2 border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-900">
                  Code promo appliqué
                </p>
                <p className="text-xs font-bold text-green-700">
                  {promoCode.code}
                </p>
              </div>
            </div>
            <p className="font-bold text-green-600">
              -{formatPrice(promoCode.discount)}
            </p>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-gray-700">
            <span>Sous-total</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-gray-700">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Livraison</span>
            </div>
            {deliveryFee === 0 ? (
              <span className="font-semibold text-green-600">Gratuit</span>
            ) : (
              <span className="font-semibold">{formatPrice(deliveryFee)}</span>
            )}
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Réduction</span>
              <span className="font-semibold">
                -{formatPrice(discountAmount)}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mt-4 border-t-2 border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-black text-orange-600">
              {formatPrice(total)}
            </span>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            TVA incluse
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
