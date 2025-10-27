'use client';

import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AddressSelector from '@/components/checkout/AddressSelector';
import AddAddressModal from '@/components/checkout/AddAddressModal';

export default function AddressesTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddressAdded = () => {
    // Force refresh of address list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
            <MapPin className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Adresses
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-500">
              Gérer mes adresses
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 h-8 sm:h-9 text-xs"
          size="sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ajouter</span>
        </Button>
      </div>

      {/* Astuce - Compact et jolie */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50 p-3">
        <p className="text-xs text-blue-900 flex items-start gap-2">
          <span className="text-sm">💡</span>
          <span>Enregistrez vos adresses fréquentes pour commander plus rapidement.</span>
        </p>
      </div>

      {/* Address List */}
      <div key={refreshKey}>
        <AddressSelector
          onSelectAddress={() => {}}
          onAddNew={() => setShowAddModal(true)}
          selectedAddressId={null}
        />
      </div>

      {/* Info Card - Compact */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
        <h3 className="font-semibold text-gray-900 mb-2 text-xs flex items-center gap-1.5">
          <span>📋</span> Informations importantes
        </h3>
        <ul className="space-y-1.5 text-[11px] sm:text-xs text-gray-600 leading-relaxed">
          <li>• Maximum 5 adresses enregistrées</li>
          <li>• Le <strong>quartier</strong> aide à situer votre zone</li>
          <li>• Le <strong>point de repère</strong> aide le livreur</li>
          <li className="hidden sm:list-item">• Les détails (porte, étage) accélèrent la livraison</li>
        </ul>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          handleAddressAdded();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
