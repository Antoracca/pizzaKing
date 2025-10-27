'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import AddressSelector, { SavedAddress } from './AddressSelector';
import AddAddressModal from './AddAddressModal';

interface ManualAddressData {
  quartier: string;
  avenue: string;
  pointDeRepere: string;
  numeroPorte: string;
  etage: string;
  instructions: string;
}

interface AddressDeliverySectionProps {
  selectedAddress: SavedAddress | null;
  manualAddress: ManualAddressData;
  saveForLater: boolean;
  onAddressSelect: (address: SavedAddress | null) => void;
  onManualAddressChange: (address: ManualAddressData) => void;
  onSaveForLaterChange: (save: boolean) => void;
  onModeChange?: (isManualMode: boolean) => void;
  errors?: Partial<ManualAddressData>;
}

export default function AddressDeliverySection({
  selectedAddress,
  manualAddress,
  saveForLater,
  onAddressSelect,
  onManualAddressChange,
  onSaveForLaterChange,
  onModeChange,
  errors = {},
}: AddressDeliverySectionProps) {
  const { user } = useAuth();
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFieldChange = (field: keyof ManualAddressData, value: string) => {
    onManualAddressChange({
      ...manualAddress,
      [field]: value,
    });
  };

  // Notify parent when mode changes
  const handleModeChange = (isManualMode: boolean) => {
    setShowNewAddressForm(isManualMode);
    onModeChange?.(isManualMode);
  };

  const handleAddressAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddModal(false);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
            <MapPin className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              Adresse de livraison
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500">
              Où souhaitez-vous recevoir votre commande ?
            </p>
          </div>
        </div>

        {/* Option selector */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={!showNewAddressForm ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange(false)}
            className="flex-1 text-xs sm:text-sm"
          >
            Mes adresses
          </Button>
          <Button
            variant={showNewAddressForm ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              handleModeChange(true);
              onAddressSelect(null);
            }}
            className="flex-1 text-xs sm:text-sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Nouvelle adresse
          </Button>
        </div>

        {!showNewAddressForm ? (
          /* Saved addresses */
          <div key={refreshKey}>
            <AddressSelector
              onSelectAddress={onAddressSelect}
              onAddNew={() => setShowAddModal(true)}
              selectedAddressId={selectedAddress?.id || null}
            />
          </div>
        ) : (
          /* Manual address form */
          <div className="space-y-3 sm:space-y-4">
            {/* Quartier */}
            <div>
              <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                Quartier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualAddress.quartier}
                onChange={(e) => handleFieldChange('quartier', e.target.value)}
                placeholder="Ex: PK5, Gobongo..."
                className={`w-full rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-3 text-sm outline-none transition-all ${
                  errors.quartier
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                }`}
              />
              {errors.quartier && (
                <p className="mt-1 text-xs text-red-600">{errors.quartier}</p>
              )}
            </div>

            {/* Avenue */}
            <div>
              <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                Avenue / Rue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualAddress.avenue}
                onChange={(e) => handleFieldChange('avenue', e.target.value)}
                placeholder="Ex: Avenue de l'Indépendance"
                className={`w-full rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-3 text-sm outline-none transition-all ${
                  errors.avenue
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                }`}
              />
              {errors.avenue && (
                <p className="mt-1 text-xs text-red-600">{errors.avenue}</p>
              )}
            </div>

            {/* Point de repère */}
            <div>
              <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                Point de repère <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualAddress.pointDeRepere}
                onChange={(e) => handleFieldChange('pointDeRepere', e.target.value)}
                placeholder="Ex: Face à la pharmacie centrale"
                className={`w-full rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-3 text-sm outline-none transition-all ${
                  errors.pointDeRepere
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                }`}
              />
              {errors.pointDeRepere && (
                <p className="mt-1 text-xs text-red-600">{errors.pointDeRepere}</p>
              )}
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                  N° Porte
                </label>
                <input
                  type="text"
                  value={manualAddress.numeroPorte}
                  onChange={(e) => handleFieldChange('numeroPorte', e.target.value)}
                  placeholder="123"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <div>
                <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                  Étage
                </label>
                <input
                  type="text"
                  value={manualAddress.etage}
                  onChange={(e) => handleFieldChange('etage', e.target.value)}
                  placeholder="2ème"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                Instructions supplémentaires
              </label>
              <textarea
                value={manualAddress.instructions}
                onChange={(e) => handleFieldChange('instructions', e.target.value)}
                placeholder="Ex: Sonnez à l'interphone..."
                rows={2}
                className="w-full resize-none rounded-lg border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            {/* Save for later option (only if user is authenticated) */}
            {user && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveForLater}
                    onChange={(e) => onSaveForLaterChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Save className="h-3 w-3 text-gray-600" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        Enregistrer cette adresse
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] sm:text-xs text-gray-600">
                      Sauvegarder dans mon compte pour mes prochaines commandes
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Add Address Modal */}
        <AddAddressModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddressAdded}
        />
      </CardContent>
    </Card>
  );
}
