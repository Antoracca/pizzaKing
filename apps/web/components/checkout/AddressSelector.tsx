'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAlertMessage } from '@/components/ui/alert-message';
import { firestoreRead, firestoreWrite, firestoreDelete } from '@/lib/firebase-retry';
import {
  MapPin,
  Plus,
  Check,
  Edit,
  Trash2,
  Home,
  Building2,
  Briefcase,
} from 'lucide-react';

export type SavedAddress = {
  id: string;
  label: string;
  quartier: string;
  avenue: string;
  pointDeRepere: string;
  numeroPorte?: string;
  etage?: string;
  instructions?: string;
  isDefault: boolean;
};

interface AddressSelectorProps {
  onSelectAddress: (address: SavedAddress | null) => void;
  onAddNew: () => void;
  selectedAddressId?: string | null;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  work: Briefcase,
  other: Building2,
};

export default function AddressSelector({
  onSelectAddress,
  onAddNew,
  selectedAddressId,
}: AddressSelectorProps) {
  const { user } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { alert, AlertMessage } = useAlertMessage();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch user addresses
  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user?.id]);

  const fetchAddresses = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Use Firestore directly with retry logic
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const fetchedAddresses = await firestoreRead(async () => {
        const addressesRef = collection(db, 'addresses');
        const q = query(
          addressesRef,
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedAddress[];
      });

      setAddresses(fetchedAddresses);

      // Auto-select default address
      const defaultAddress = fetchedAddresses.find(a => a.isDefault);
      if (defaultAddress && !selectedAddressId) {
        onSelectAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      alert({
        title: 'Erreur',
        description: 'Impossible de charger vos adresses. Veuillez réessayer.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    confirm({
      title: 'Supprimer l\'adresse',
      description: 'Êtes-vous sûr de vouloir supprimer cette adresse ? Cette action est irréversible.',
      variant: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          setDeleting(addressId);

          // Use Firestore directly with retry logic
          const { doc, deleteDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          await firestoreDelete(async () => {
            return deleteDoc(doc(db, 'addresses', addressId));
          });

          setAddresses(prev => prev.filter(a => a.id !== addressId));
          if (selectedAddressId === addressId) {
            onSelectAddress(null);
          }
        } catch (error) {
          console.error('Failed to delete address:', error);
          alert({
            title: 'Erreur',
            description: 'Erreur lors de la suppression de l\'adresse',
            variant: 'error',
          });
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user?.id) return;

    try {
      // Use Firestore directly with retry logic
      const { collection, query, where, getDocs, doc, updateDoc, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      await firestoreWrite(async () => {
        const addressesRef = collection(db, 'addresses');
        const q = query(addressesRef, where('userId', '==', user.id));
        const snapshot = await getDocs(q);

        // Update all addresses: set isDefault based on whether it's the target address
        const updatePromises = snapshot.docs.map(docSnapshot =>
          updateDoc(doc(db, 'addresses', docSnapshot.id), {
            isDefault: docSnapshot.id === addressId,
            updatedAt: Timestamp.now(),
          })
        );

        return Promise.all(updatePromises);
      });

      setAddresses(prev =>
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
        }))
      );
    } catch (error) {
      console.error('Failed to set default address:', error);
      alert({
        title: 'Erreur',
        description: 'Impossible de définir l\'adresse par défaut',
        variant: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Saved Addresses */}
      {addresses.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 sm:p-8 text-center">
            <MapPin className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
            <p className="text-sm sm:text-base text-gray-500">
              Aucune adresse enregistrée
            </p>
            <p className="mt-1 text-xs sm:text-sm text-gray-400">
              Ajoutez votre première adresse pour gagner du temps
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          <AnimatePresence>
            {addresses.map(address => {
              const Icon = ICON_MAP[address.label.toLowerCase()] || Building2;
              const isSelected = selectedAddressId === address.id;

              return (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-2 border-orange-500 bg-orange-50'
                        : 'border border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => onSelectAddress(address)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <div
                            className={`flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full ${
                              isSelected ? 'bg-orange-200' : 'bg-gray-100'
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                isSelected ? 'text-orange-600' : 'text-gray-600'
                              }`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm sm:text-base font-semibold capitalize text-gray-900 truncate">
                                {address.label}
                              </p>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                                  Défaut
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-0.5 text-xs sm:text-sm text-gray-600">
                              <p className="font-medium truncate">{address.quartier}</p>
                              <p className="truncate">{address.avenue}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                                📍 {address.pointDeRepere}
                              </p>
                              {address.numeroPorte && (
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                  Porte {address.numeroPorte}
                                  {address.etage && ` • ${address.etage}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-orange-500">
                              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Address Actions */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 sm:mt-3 flex flex-col sm:flex-row gap-2 border-t border-orange-200 pt-2 sm:pt-3"
                        >
                          {!address.isDefault && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[11px] sm:text-xs w-full sm:w-auto justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(address.id);
                              }}
                            >
                              Définir par défaut
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[11px] sm:text-xs text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto sm:ml-auto justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(address.id);
                            }}
                            disabled={deleting === address.id}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            {deleting === address.id ? 'Suppression...' : 'Supprimer'}
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      <ConfirmDialog />
      <AlertMessage />
    </div>
  );
}
