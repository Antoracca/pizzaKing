'use client';

import { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface CardPaymentFormProps {
  onSubmit: (data: CardPaymentData) => void;
  isProcessing?: boolean;
}

export interface CardPaymentData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardType: 'visa' | 'mastercard' | 'gimac' | 'amex' | null;
}

const CARD_TYPES = [
  { id: 'visa', name: 'Visa', pattern: /^4/, icon: '💳' },
  { id: 'mastercard', name: 'Mastercard', pattern: /^5[1-5]/, icon: '💳' },
  { id: 'gimac', name: 'GIMAC', pattern: /^9/, icon: '💳' },
  { id: 'amex', name: 'American Express', pattern: /^3[47]/, icon: '💳' },
];

export default function CardPaymentForm({ onSubmit, isProcessing = false }: CardPaymentFormProps) {
  const [formData, setFormData] = useState<CardPaymentData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    cardType: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CardPaymentData, string>>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Détecter le type de carte
  const detectCardType = (number: string): CardPaymentData['cardType'] => {
    const cleaned = number.replace(/\s/g, '');
    for (const card of CARD_TYPES) {
      if (card.pattern.test(cleaned)) {
        return card.id as CardPaymentData['cardType'];
      }
    }
    return null;
  };

  // Formater le numéro de carte (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Formater la date d'expiration (MM/YY)
  const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      const cardType = detectCardType(formatted);
      setFormData({ ...formData, cardNumber: formatted, cardType });
      setErrors({ ...errors, cardNumber: '' });
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    if (formatted.replace(/\D/g, '').length <= 4) {
      setFormData({ ...formData, expiryDate: formatted });
      setErrors({ ...errors, expiryDate: '' });
    }
  };

  const handleCvvChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= (formData.cardType === 'amex' ? 4 : 3)) {
      setFormData({ ...formData, cvv: cleaned });
      setErrors({ ...errors, cvv: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CardPaymentData, string>> = {};

    // Numéro de carte
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      newErrors.cardNumber = 'Numéro de carte requis';
    } else if (cardNumberClean.length < 13 || cardNumberClean.length > 16) {
      newErrors.cardNumber = 'Numéro de carte invalide';
    }

    // Nom du titulaire
    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Nom du titulaire requis';
    } else if (formData.cardHolder.trim().length < 3) {
      newErrors.cardHolder = 'Nom trop court';
    }

    // Date d'expiration
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Date d\'expiration requise';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Date invalide (MM/YY)';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Carte expirée';
      }
    }

    // CVV
    const cvvLength = formData.cardType === 'amex' ? 4 : 3;
    if (!formData.cvv) {
      newErrors.cvv = 'CVV requis';
    } else if (formData.cvv.length !== cvvLength) {
      newErrors.cvv = `CVV doit contenir ${cvvLength} chiffres`;
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
      {/* Card Types - Icons */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
        <span className="text-xs sm:text-sm font-medium text-gray-700">Cartes acceptées</span>
        <div className="flex items-center gap-2">
          {CARD_TYPES.map((card) => (
            <div
              key={card.id}
              className={`flex h-8 w-12 items-center justify-center rounded border-2 transition-all ${
                formData.cardType === card.id
                  ? 'border-orange-500 bg-orange-50 scale-110'
                  : 'border-gray-300 bg-white opacity-50'
              }`}
            >
              <span className="text-xs font-bold" title={card.name}>
                {card.id.substring(0, 1).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Number */}
      <div>
        <label className="mb-2 block text-xs sm:text-sm font-medium text-gray-700">
          Numéro de carte <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            onFocus={() => setFocusedField('cardNumber')}
            onBlur={() => setFocusedField(null)}
            placeholder="1234 5678 9012 3456"
            className={`w-full rounded-lg border-2 px-4 py-3 pl-12 text-sm sm:text-base font-mono outline-none transition-all ${
              errors.cardNumber
                ? 'border-red-500 focus:border-red-500'
                : focusedField === 'cardNumber'
                ? 'border-orange-500 ring-4 ring-orange-500/10'
                : 'border-gray-200 focus:border-orange-500'
            }`}
            disabled={isProcessing}
          />
          <CreditCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
        {errors.cardNumber && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Card Holder */}
      <div>
        <label className="mb-2 block text-xs sm:text-sm font-medium text-gray-700">
          Nom du titulaire <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.cardHolder}
          onChange={(e) => {
            setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() });
            setErrors({ ...errors, cardHolder: '' });
          }}
          onFocus={() => setFocusedField('cardHolder')}
          onBlur={() => setFocusedField(null)}
          placeholder="JEAN DUPONT"
          className={`w-full rounded-lg border-2 px-4 py-3 text-sm sm:text-base uppercase outline-none transition-all ${
            errors.cardHolder
              ? 'border-red-500 focus:border-red-500'
              : focusedField === 'cardHolder'
              ? 'border-orange-500 ring-4 ring-orange-500/10'
              : 'border-gray-200 focus:border-orange-500'
          }`}
          disabled={isProcessing}
        />
        {errors.cardHolder && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.cardHolder}
          </p>
        )}
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="mb-2 block text-xs sm:text-sm font-medium text-gray-700">
            Expiration <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.expiryDate}
            onChange={(e) => handleExpiryChange(e.target.value)}
            onFocus={() => setFocusedField('expiryDate')}
            onBlur={() => setFocusedField(null)}
            placeholder="MM/YY"
            className={`w-full rounded-lg border-2 px-4 py-3 text-sm sm:text-base font-mono outline-none transition-all ${
              errors.expiryDate
                ? 'border-red-500 focus:border-red-500'
                : focusedField === 'expiryDate'
                ? 'border-orange-500 ring-4 ring-orange-500/10'
                : 'border-gray-200 focus:border-orange-500'
            }`}
            disabled={isProcessing}
          />
          {errors.expiryDate && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {errors.expiryDate}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs sm:text-sm font-medium text-gray-700">
            CVV <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.cvv}
            onChange={(e) => handleCvvChange(e.target.value)}
            onFocus={() => setFocusedField('cvv')}
            onBlur={() => setFocusedField(null)}
            placeholder="123"
            className={`w-full rounded-lg border-2 px-4 py-3 text-sm sm:text-base font-mono outline-none transition-all ${
              errors.cvv
                ? 'border-red-500 focus:border-red-500'
                : focusedField === 'cvv'
                ? 'border-orange-500 ring-4 ring-orange-500/10'
                : 'border-gray-200 focus:border-orange-500'
            }`}
            disabled={isProcessing}
          />
          {errors.cvv && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Important Points */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <h4 className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-900">
          <span>⚠️</span> Points importants
        </h4>
        <ul className="space-y-1.5 text-xs text-amber-900">
          <li className="flex gap-2">
            <span>•</span>
            <span>Vérifiez les informations avant de valider</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Paiement 100% sécurisé et crypté</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Vous recevrez une confirmation par email</span>
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-sm sm:text-base font-semibold"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Payer maintenant
          </>
        )}
      </Button>
    </form>
  );
}
