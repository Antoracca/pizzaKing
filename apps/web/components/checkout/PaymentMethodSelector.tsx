'use client';

import { CreditCard, Smartphone, Banknote, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export type PaymentMethod = 'card' | 'mobile_money' | 'cash';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS = [
  {
    id: 'card' as PaymentMethod,
    name: 'Carte bancaire',
    description: 'Visa, Mastercard, GIMAC, Amex',
    icon: CreditCard,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'Sécurisé',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'mobile_money' as PaymentMethod,
    name: 'Mobile Money',
    description: 'Orange Money, Telecel Money',
    icon: Smartphone,
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-50 to-red-50',
    borderColor: 'border-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    badge: 'Rapide',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'cash' as PaymentMethod,
    name: 'Espèces',
    description: 'Paiement à la livraison',
    icon: Banknote,
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    badge: 'Simple',
    badgeColor: 'bg-green-100 text-green-700',
  },
];

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Choisissez votre mode de paiement
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Sélectionnez comment vous souhaitez régler votre commande
        </p>
      </div>

      {PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        const Icon = method.icon;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onMethodChange(method.id)}
            className={`group relative w-full overflow-hidden rounded-xl border-2 transition-all ${
              isSelected
                ? `${method.borderColor} shadow-lg`
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className={`relative p-4 sm:p-5 ${isSelected ? `bg-gradient-to-br ${method.bgGradient}` : 'bg-white'}`}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl ${
                    isSelected ? `bg-gradient-to-br ${method.gradient}` : method.iconBg
                  } transition-all`}
                >
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${isSelected ? 'text-white' : method.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900">
                        {method.name}
                      </h4>
                      <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>

                    {/* Badge */}
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold ${method.badgeColor}`}
                    >
                      {method.badge}
                    </span>
                  </div>

                  {/* Features */}
                  {isSelected && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {method.id === 'card' && (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                            <span className="text-green-600">✓</span> 3D Secure
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                            <span className="text-green-600">✓</span> Crypté SSL
                          </span>
                        </>
                      )}
                      {method.id === 'mobile_money' && (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                            <span className="text-green-600">✓</span> Instant
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                            <span className="text-green-600">✓</span> Sans frais
                          </span>
                        </>
                      )}
                      {method.id === 'cash' && (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                            <span className="text-green-600">✓</span> Sans compte
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                            <span className="text-green-600">✓</span> Vérification avant paiement
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Arrow indicator */}
                <ChevronRight
                  className={`h-5 w-5 flex-shrink-0 transition-all ${
                    isSelected
                      ? 'text-gray-900 rotate-90'
                      : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                  }`}
                />
              </div>
            </div>

            {/* Selection indicator line */}
            {isSelected && (
              <div className={`h-1 w-full bg-gradient-to-r ${method.gradient}`} />
            )}
          </button>
        );
      })}

      {/* Security badge */}
      <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gray-50 py-2 px-3">
        <span className="text-base">🔒</span>
        <span className="text-xs text-gray-600">
          Tous les paiements sont sécurisés et conformes PCI DSS
        </span>
      </div>
    </div>
  );
}
