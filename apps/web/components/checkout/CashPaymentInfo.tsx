'use client';

import { Banknote, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CashPaymentInfoProps {
  onConfirm: () => void;
  isProcessing?: boolean;
  estimatedDeliveryTime?: string;
}

export default function CashPaymentInfo({
  onConfirm,
  isProcessing = false,
  estimatedDeliveryTime = '30-45 minutes',
}: CashPaymentInfoProps) {
  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Banknote className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-lg sm:text-xl font-bold">
              Paiement en espèces
            </h3>
            <p className="text-sm text-white/90">
              Payez directement au livreur à la réception de votre commande
            </p>
          </div>
        </div>
      </div>

      {/* Important Points */}
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-900">
          <span className="text-base">⚠️</span>
          Points importants
        </h4>
        <ul className="space-y-2 text-xs text-amber-900">
          <li className="flex gap-2">
            <span>•</span>
            <span>Préparez l'appoint si possible</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Vérifiez votre commande avant de payer</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Le livreur vous remettra un reçu</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Livraison estimée : {estimatedDeliveryTime}</span>
          </li>
        </ul>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={onConfirm}
        disabled={isProcessing}
        className="w-full h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-600"
      >
        {isProcessing ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Confirmation en cours...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Confirmer et commander
          </>
        )}
      </Button>
    </div>
  );
}
