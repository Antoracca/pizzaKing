'use client';

import Image from 'next/image';
import { CreditCard, Smartphone, Banknote, Check } from 'lucide-react';

export type PaymentMethod = 'card' | 'mobile_money' | 'cash';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS = [
  {
    id: 'card' as PaymentMethod,
    name: 'Carte',
    icon: CreditCard,
    bgColor: 'bg-blue-50',
    selectedBg: 'bg-blue-500',
    borderColor: 'border-blue-500',
    hoverBg: 'hover:bg-blue-50',
  },
  {
    id: 'mobile_money' as PaymentMethod,
    name: 'Mobile Money',
    icon: Smartphone,
    bgColor: 'bg-orange-50',
    selectedBg: 'bg-orange-500',
    borderColor: 'border-orange-500',
    hoverBg: 'hover:bg-orange-50',
  },
  {
    id: 'cash' as PaymentMethod,
    name: 'Espèces',
    icon: Banknote,
    bgColor: 'bg-green-50',
    selectedBg: 'bg-green-500',
    borderColor: 'border-green-500',
    hoverBg: 'hover:bg-green-50',
  },
];

const CardLogos = () => (
  <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full">
    <div className="relative h-3.5 w-5 sm:h-4 sm:w-6 flex-shrink-0">
      <Image
        src="https://www.svgrepo.com/show/328144/visa.svg"
        alt="Visa"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
    <div className="relative h-3.5 w-5 sm:h-4 sm:w-6 flex-shrink-0">
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
        alt="MC"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
    <div className="relative h-3.5 w-5 sm:h-4 sm:w-6 flex-shrink-0">
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
        alt="Amex"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
    <div className="flex h-3.5 w-5 sm:h-4 sm:w-6 items-center justify-center rounded bg-green-600 flex-shrink-0">
      <span className="text-[6px] sm:text-[7px] font-bold text-white">GIMAC</span>
    </div>
  </div>
);

const MobileMoneyLogos = () => (
  <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full">
    <div className="relative h-4 w-8 flex-shrink-0">
      <Image
        src="/orange-money-1280x634.jpg"
        alt="Orange"
        fill
        className="object-contain"
      />
    </div>
    <div className="relative h-4 w-8 flex-shrink-0">
      <Image
        src="/telecelcash.ebp.webp"
        alt="Telecel"
        fill
        className="object-contain"
      />
    </div>
  </div>
);

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="w-full max-w-full min-w-0">
      {/* Méthodes de paiement */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-full">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onMethodChange(method.id)}
              className={`
                relative flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 p-2 sm:p-3 transition-all min-w-0 max-w-full
                ${isSelected
                  ? `${method.borderColor} ${method.bgColor} shadow-md`
                  : `border-gray-200 bg-white ${method.hoverBg} hover:border-gray-300`
                }
              `}
            >
              {/* Icône */}
              <div
                className={`
                  flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors flex-shrink-0
                  ${isSelected ? `${method.selectedBg} text-white` : `${method.bgColor} text-gray-700`}
                `}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              {/* Nom */}
              <span className="text-[10px] sm:text-xs font-medium text-gray-900 text-center leading-tight">
                {method.name}
              </span>

              {/* Logos des cartes / Mobile Money */}
              {method.id === 'card' && <CardLogos />}
              {method.id === 'mobile_money' && <MobileMoneyLogos />}
              {method.id === 'cash' && (
                <span className="text-[9px] sm:text-[10px] text-gray-500">Livraison</span>
              )}

              {/* Checkmark si sélectionné */}
              {isSelected && (
                <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-full ${method.selectedBg}`}>
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Badge sécurité épuré */}
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 text-[10px] sm:text-xs text-gray-600">
        <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="truncate">Paiement 100% sécurisé</span>
      </div>
    </div>
  );
}
