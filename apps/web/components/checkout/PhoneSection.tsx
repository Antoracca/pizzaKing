'use client';

import { useState, useEffect } from 'react';
import { Phone, Edit2, Check, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { validatePhoneNumber } from '@/lib/phone-validation';

interface PhoneSectionProps {
  userPhone: string | null;
  currentPhone: string;
  onPhoneChange: (phone: string) => void;
  error?: string;
}

export default function PhoneSection({
  userPhone,
  currentPhone,
  onPhoneChange,
  error,
}: PhoneSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPhone, setTempPhone] = useState(currentPhone);
  const [phoneJustAdded, setPhoneJustAdded] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  const handleSave = () => {
    // Validate phone before saving
    const validation = validatePhoneNumber(tempPhone);

    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    // Clear error and save with formatted number
    setValidationError(undefined);
    const phoneToSave = validation.formatted || tempPhone;
    onPhoneChange(phoneToSave);
    setTempPhone(phoneToSave);
    setIsEditing(false);

    // Si c'était un ajout (pas de userPhone), marquer comme ajouté
    if (!userPhone && phoneToSave) {
      setPhoneJustAdded(true);
    }
  };

  const handlePhoneChange = (value: string) => {
    setTempPhone(value);
    // Clear validation error when user types
    if (validationError) {
      setValidationError(undefined);
    }
  };

  const handleCancel = () => {
    setTempPhone(currentPhone);
    setIsEditing(false);
  };

  const hasPhoneInAccount = !!userPhone;
  const noPhoneYet = !userPhone && !currentPhone;

  // Auto-open edit mode if no phone number at all
  useEffect(() => {
    if (noPhoneYet) {
      setIsEditing(true);
    }
  }, [noPhoneYet]);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <Phone className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Numéro de téléphone
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Le livreur vous contactera sur ce numéro
              </p>
            </div>
          </div>

          {hasPhoneInAccount && (
            <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
              Depuis compte
            </Badge>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-3">
            {/* Numéro ajouté/existant */}
            <div className="flex items-center justify-between rounded-lg border-2 border-green-500 bg-green-50 p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {currentPhone}
                  </span>
                  {phoneJustAdded && (
                    <p className="text-xs text-green-700 mt-0.5">
                      Numéro ajouté pour cette commande
                    </p>
                  )}
                </div>
              </div>

              {hasPhoneInAccount && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-xs"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
              )}
            </div>

            {/* Messages selon le contexte */}
            {hasPhoneInAccount ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-xs text-green-900">
                  ✅ Nous utiliserons ce numéro pour vous joindre. Si ce numéro est injoignable, vous pouvez le modifier temporairement.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-900">
                  ℹ️ Ce numéro sera utilisé <strong>uniquement pour cette commande</strong>. Il ne sera pas enregistré dans votre compte.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <input
                type="tel"
                value={tempPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+236 70 12 34 56 ou 70123456"
                className={`w-full rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none transition-all ${
                  validationError || error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                }`}
                autoFocus
              />
              {(validationError || error) && (
                <p className="mt-1 text-xs text-red-600">{validationError || error}</p>
              )}
            </div>

            <div className="flex gap-2">
              {hasPhoneInAccount && (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Annuler
                </Button>
              )}
              <Button
                onClick={handleSave}
                size="sm"
                className={hasPhoneInAccount ? "flex-1 text-xs" : "w-full text-xs"}
                disabled={!tempPhone.trim()}
              >
                <Check className="h-3 w-3 mr-1" />
                {hasPhoneInAccount ? 'Confirmer' : 'Valider temporairement'}
              </Button>
            </div>

            {!hasPhoneInAccount ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-900">
                  💡 Ajoutez un numéro pour être joignable lors de la livraison. Ce numéro sera utilisé uniquement pour cette commande.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-900">
                  💡 Cette modification est temporaire et ne changera pas votre numéro dans le compte.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
