'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import {
  X,
  Home,
  Briefcase,
  Building2,
  AlertCircle,
  MapPin,
  Phone,
} from 'lucide-react';

type AddressLabel = 'home' | 'work' | 'other';

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAddressModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAddressModalProps) {
  const { user } = useAuth();
  const [label, setLabel] = useState<AddressLabel>('home');
  const [formData, setFormData] = useState({
    quartier: '',
    avenue: '',
    pointDeRepere: '',
    numeroPorte: '',
    etage: '',
    instructions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labelOptions: Array<{ id: AddressLabel; label: string; icon: any }> = [
    { id: 'home', label: 'Maison', icon: Home },
    { id: 'work', label: 'Travail', icon: Briefcase },
    { id: 'other', label: 'Autre', icon: Building2 },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.quartier.trim()) {
      newErrors.quartier = 'Le quartier est requis';
    }

    if (!formData.avenue.trim()) {
      newErrors.avenue = 'L\'avenue/rue est requise';
    }

    if (!formData.pointDeRepere.trim()) {
      newErrors.pointDeRepere = 'Le point de repère est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!user?.id) {
      alert('Vous devez être connecté pour enregistrer une adresse');
      return;
    }

    setIsSubmitting(true);

    try {
      // Import Firestore functions
      const { collection, addDoc, query, where, getDocs, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const addressesRef = collection(db, 'addresses');

      // Check if user already has 5 addresses (max limit)
      const userAddressesQuery = query(addressesRef, where('userId', '==', user.id));
      const existingSnapshot = await getDocs(userAddressesQuery);

      if (existingSnapshot.size >= 5) {
        throw new Error('Vous ne pouvez avoir que 5 adresses maximum');
      }

      // Check if this is the first address (make it default)
      const isFirstAddress = existingSnapshot.size === 0;

      // Add new address to Firestore
      await addDoc(addressesRef, {
        userId: user.id,
        label,
        quartier: formData.quartier.trim(),
        avenue: formData.avenue.trim(),
        pointDeRepere: formData.pointDeRepere.trim(),
        numeroPorte: formData.numeroPorte?.trim() || '',
        etage: formData.etage?.trim() || '',
        instructions: formData.instructions?.trim() || '',
        isDefault: isFirstAddress,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Reset form
      setFormData({
        quartier: '',
        avenue: '',
        pointDeRepere: '',
        numeroPorte: '',
        etage: '',
        instructions: '',
      });
      setLabel('home');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to add address:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'ajout de l\'adresse');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        >
          <Card className="border-0 sm:border">
            <CardContent className="p-4 sm:p-6">
              {/* Header */}
              <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Ajouter une adresse
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Enregistrez votre adresse pour vos commandes
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-gray-100 flex-shrink-0"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Address Label */}
                <div>
                  <label className="mb-2 sm:mb-3 block text-xs sm:text-sm font-medium text-gray-700">
                    Type d'adresse
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {labelOptions.map(option => {
                      const Icon = option.icon;
                      const isSelected = label === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setLabel(option.id)}
                          className={`rounded-xl border-2 p-3 sm:p-4 transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <Icon
                            className={`mx-auto mb-1 sm:mb-2 h-5 w-5 sm:h-6 sm:w-6 ${
                              isSelected ? 'text-orange-600' : 'text-gray-400'
                            }`}
                          />
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              isSelected ? 'text-orange-900' : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quartier */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Quartier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.quartier}
                    onChange={e => handleInputChange('quartier', e.target.value)}
                    placeholder="Ex: PK5, Gobongo, Fatima..."
                    className={`w-full rounded-xl border-2 px-4 py-3 outline-none transition-all focus:ring-4 ${
                      errors.quartier
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/10'
                    }`}
                  />
                  {errors.quartier && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.quartier}
                    </p>
                  )}
                </div>

                {/* Avenue/Rue */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Avenue / Rue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.avenue}
                    onChange={e => handleInputChange('avenue', e.target.value)}
                    placeholder="Ex: Avenue de l'Indépendance"
                    className={`w-full rounded-xl border-2 px-4 py-3 outline-none transition-all focus:ring-4 ${
                      errors.avenue
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/10'
                    }`}
                  />
                  {errors.avenue && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.avenue}
                    </p>
                  )}
                </div>

                {/* Point de repère */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Point de repère <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.pointDeRepere}
                      onChange={e =>
                        handleInputChange('pointDeRepere', e.target.value)
                      }
                      placeholder="Ex: Face à la pharmacie centrale, à côté du marché..."
                      className={`w-full rounded-xl border-2 pl-11 pr-4 py-3 outline-none transition-all focus:ring-4 ${
                        errors.pointDeRepere
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/10'
                      }`}
                    />
                  </div>
                  {errors.pointDeRepere && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.pointDeRepere}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Indiquez un point de repère connu pour aider le livreur
                  </p>
                </div>

                {/* Numéro de porte et étage */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Numéro de porte
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.numeroPorte}
                        onChange={e =>
                          handleInputChange('numeroPorte', e.target.value)
                        }
                        placeholder="Ex: 123"
                        className="w-full rounded-xl border-2 border-gray-200 pl-11 pr-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Étage
                    </label>
                    <input
                      type="text"
                      value={formData.etage}
                      onChange={e => handleInputChange('etage', e.target.value)}
                      placeholder="Ex: 2ème"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>
                </div>

                {/* Instructions supplémentaires */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Instructions supplémentaires
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={e =>
                      handleInputChange('instructions', e.target.value)
                    }
                    placeholder="Ex: Sonnez à l'interphone, code 1234. Le portail est bleu..."
                    rows={3}
                    className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Toute information supplémentaire pour faciliter la livraison
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 border-t border-gray-200 pt-4 sm:pt-6 -mx-4 sm:mx-0 px-4 sm:px-0 pb-safe">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
