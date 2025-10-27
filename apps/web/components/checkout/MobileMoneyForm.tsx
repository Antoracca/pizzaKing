'use client';

import { useState } from 'react';
import { Smartphone, Lock, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMoneyFormProps {
  onSubmit: (data: MobileMoneyData) => void;
  isProcessing?: boolean;
}

export interface MobileMoneyData {
  operator: 'orange' | 'telecel';
  phoneNumber: string;
}

const OPERATORS = [
  {
    id: 'orange',
    name: 'Orange Money',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-900',
    icon: '🟠',
    prefix: '+236 07',
  },
  {
    id: 'telecel',
    name: 'Telecel Money',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-900',
    icon: '🔵',
    prefix: '+236 06',
  },
];

export default function MobileMoneyForm({ onSubmit, isProcessing = false }: MobileMoneyFormProps) {
  const [formData, setFormData] = useState<MobileMoneyData>({
    operator: 'orange',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MobileMoneyData, string>>>({});

  const selectedOperator = OPERATORS.find((op) => op.id === formData.operator)!;

  const handleOperatorChange = (operator: 'orange' | 'telecel') => {
    setFormData({ ...formData, operator, phoneNumber: '' });
    setErrors({});
  };

  const formatPhoneNumber = (value: string): string => {
    // Supprimer tout sauf les chiffres
    const cleaned = value.replace(/\D/g, '');
    // Format: XX XX XX XX
    const chunks = cleaned.match(/.{1,2}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    // Limiter à 8 chiffres (XX XX XX XX)
    if (formatted.replace(/\s/g, '').length <= 8) {
      setFormData({ ...formData, phoneNumber: formatted });
      setErrors({ ...errors, phoneNumber: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MobileMoneyData, string>> = {};

    const phoneClean = formData.phoneNumber.replace(/\s/g, '');
    if (!phoneClean) {
      newErrors.phoneNumber = 'Numéro de téléphone requis';
    } else if (phoneClean.length !== 8) {
      newErrors.phoneNumber = 'Numéro invalide (8 chiffres requis)';
    } else {
      // Validation selon l'opérateur
      if (formData.operator === 'orange' && !phoneClean.startsWith('7')) {
        newErrors.phoneNumber = 'Orange Money commence par 07';
      } else if (formData.operator === 'telecel' && !phoneClean.startsWith('6')) {
        newErrors.phoneNumber = 'Telecel Money commence par 06';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Operator Selection */}
      <div>
        <label className="mb-3 block text-xs sm:text-sm font-medium text-gray-700">
          Choisissez votre opérateur <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {OPERATORS.map((operator) => (
            <button
              key={operator.id}
              type="button"
              onClick={() => handleOperatorChange(operator.id as 'orange' | 'telecel')}
              className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                formData.operator === operator.id
                  ? `${operator.borderColor} ${operator.bgColor} shadow-lg`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-3xl">{operator.icon}</span>
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    formData.operator === operator.id ? operator.textColor : 'text-gray-700'
                  }`}
                >
                  {operator.name}
                </span>
                {formData.operator === operator.id && (
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-lg">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${operator.color} opacity-0 transition-opacity group-hover:opacity-5`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="mb-2 block text-xs sm:text-sm font-medium text-gray-700">
          Numéro {selectedOperator.name} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500 font-mono">{selectedOperator.prefix}</span>
          </div>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="XX XX XX XX"
            className={`w-full rounded-lg border-2 px-4 py-3 pl-32 text-sm sm:text-base font-mono outline-none transition-all ${
              errors.phoneNumber
                ? 'border-red-500 focus:border-red-500'
                : `border-gray-200 focus:${selectedOperator.borderColor} focus:ring-4 focus:ring-${formData.operator === 'orange' ? 'orange' : 'blue'}-500/10`
            }`}
            disabled={isProcessing}
          />
        </div>
        {errors.phoneNumber && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.phoneNumber}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Entrez votre numéro {selectedOperator.name} (8 chiffres)
        </p>
      </div>

      {/* Important Points */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <h4 className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-900">
          <span>⚠️</span> Points importants
        </h4>
        <ul className="space-y-1.5 text-xs text-amber-900">
          <li className="flex gap-2">
            <span>•</span>
            <span>Vous recevrez un code USSD sur votre téléphone</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Validez avec votre code PIN {selectedOperator.name}</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Confirmation automatique après paiement</span>
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className={`w-full h-12 text-sm sm:text-base font-semibold bg-gradient-to-r ${selectedOperator.color}`}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Smartphone className="mr-2 h-4 w-4" />
            Payer avec {selectedOperator.name}
          </>
        )}
      </Button>
    </form>
  );
}
