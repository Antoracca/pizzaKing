'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ✅ Désactiver le prerendering pour cette page (nécessite searchParams dynamiques)
export const dynamic = 'force-dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { validatePhoneNumber } from '@/lib/phone-validation';
import Header from '@/components/layout/Header';
import OrderSummary from '@/components/checkout/OrderSummary';
import PhoneSection from '@/components/checkout/PhoneSection';
import AddressDeliverySection from '@/components/checkout/AddressDeliverySection';
import PaymentMethodSelector, { PaymentMethod } from '@/components/checkout/PaymentMethodSelector';
import MobileMoneyForm, { MobileMoneyData } from '@/components/checkout/MobileMoneyForm';
import CashPaymentInfo from '@/components/checkout/CashPaymentInfo';
import { SavedAddress } from '@/components/checkout/AddressSelector';
import { useCartContext } from '@/providers/CartProvider';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import {
  MapPin,
  CreditCard,
  Check,
  ShoppingBag,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DELIVERY_CONFIG } from '@/lib/config';
import { firestoreWrite } from '@/lib/firebase-retry';

const steps = [
  { id: 1, name: 'Livraison', icon: MapPin },
  { id: 2, name: 'Paiement', icon: CreditCard },
  { id: 3, name: 'Confirmation', icon: Check },
];

type ManualAddressData = {
  quartier: string;
  avenue: string;
  pointDeRepere: string;
  numeroPorte: string;
  etage: string;
  instructions: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, itemCount, clearCart } = useCartContext();
  const { user, loading: authLoading } = useAuth();

  const stepFromQuery = searchParams.get('step');
  const parsedInitialStep = stepFromQuery ? Number(stepFromQuery) : NaN;
  const initialStep =
    !Number.isNaN(parsedInitialStep) && parsedInitialStep >= 1 && parsedInitialStep <= 3
      ? parsedInitialStep
      : 1;
  const orderRefFromQuery = searchParams.get('order_ref') ?? '';

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [mobileMoneyData, setMobileMoneyData] = useState<MobileMoneyData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState(orderRefFromQuery);

  // Générer un orderReference unique pour cette session (comme dans payment/card)
  const [orderReference] = useState(() => `PK${Date.now().toString().slice(-8)}`);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Phone state
  const [currentPhone, setCurrentPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Address state
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [manualAddress, setManualAddress] = useState<ManualAddressData>({
    quartier: '',
    avenue: '',
    pointDeRepere: '',
    numeroPorte: '',
    etage: '',
    instructions: '',
  });
  const [saveAddressForLater, setSaveAddressForLater] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Partial<ManualAddressData>>({});
  const [isManualAddressMode, setIsManualAddressMode] = useState(false);

  useEffect(() => {
    const stepParam = searchParams.get('step');
    const parsedStep = stepParam ? Number(stepParam) : NaN;

    if (!Number.isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 3) {
      setCurrentStep(prev => (prev === parsedStep ? prev : parsedStep));
      
      // 🧹 Nettoyer pending_checkout quand on arrive sur la confirmation (step 3)
      if (parsedStep === 3) {
        localStorage.removeItem('pending_checkout');
        localStorage.removeItem('pending_delivery_info');
        console.log('🧹 Nettoyage pending_checkout sur page de confirmation');
      }
    }

    const orderRefParam = searchParams.get('order_ref');
    if (orderRefParam) {
      setOrderNumber(prev => (prev === orderRefParam ? prev : orderRefParam));
    }
  }, [searchParams]);

  // Initialize phone from user account
  useEffect(() => {
    if (user?.phoneNumber) {
      setCurrentPhone(user.phoneNumber);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('checkout_redirect', 'true');
      setShowAuthWarning(true);

      const timer = setTimeout(() => {
        router.push('/auth/login?redirect=/checkout');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (itemCount === 0 && currentStep === 1 && !authLoading) {
      router.push('/menu');
    }
  }, [itemCount, currentStep, router, authLoading]);

  // Validate Step 1 (Delivery)
  const validateStep1 = (): boolean => {
    console.log('🔍 Validation started');
    console.log('Phone:', currentPhone);
    console.log('isManualAddressMode:', isManualAddressMode);
    console.log('selectedAddress:', selectedAddress);
    console.log('manualAddress:', manualAddress);

    let isValid = true;

    // Validate phone avec la nouvelle fonction intelligente
    const phoneValidation = validatePhoneNumber(currentPhone);
    if (!phoneValidation.isValid) {
      console.log('❌ Phone validation failed:', phoneValidation.error);
      setPhoneError(phoneValidation.error || 'Numéro invalide');
      isValid = false;
    } else {
      console.log('✅ Phone validation passed. Formatted:', phoneValidation.formatted);
      setPhoneError('');
      // Optionnel: mettre à jour avec le format international
      if (phoneValidation.formatted && phoneValidation.formatted !== currentPhone) {
        setCurrentPhone(phoneValidation.formatted);
      }
    }

    // Validate address
    if (isManualAddressMode) {
      console.log('📝 Validating manual address');
      // Validate manual address fields
      const newAddressErrors: Partial<ManualAddressData> = {};

      if (!manualAddress.quartier.trim()) {
        newAddressErrors.quartier = 'Quartier requis';
        isValid = false;
      }

      if (!manualAddress.avenue.trim()) {
        newAddressErrors.avenue = 'Avenue/Rue requise';
        isValid = false;
      }

      if (!manualAddress.pointDeRepere.trim()) {
        newAddressErrors.pointDeRepere = 'Point de repère requis';
        isValid = false;
      }

      console.log('Manual address errors:', newAddressErrors);
      setAddressErrors(newAddressErrors);
    } else {
      console.log('🏠 Validating saved address');
      // Validate that a saved address is selected
      if (!selectedAddress) {
        console.log('❌ No saved address selected');
        alert('Veuillez sélectionner une adresse ou ajouter une nouvelle adresse');
        isValid = false;
      } else {
        console.log('✅ Saved address selected');
      }
      setAddressErrors({});
    }

    console.log('Final validation result:', isValid);
    return isValid;
  };

  // Handle Step 1 Continue
  const handleStep1Continue = () => {
    console.log('🚀 handleStep1Continue called');
    const isValid = validateStep1();
    console.log('Validation result:', isValid);

    if (isValid) {
      console.log('✅ Moving to step 2');
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log('❌ Validation failed, staying on step 1');
      // Scroll to top to show validation errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle order submission
  const handleOrderSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Determine final address data
      const addressData = selectedAddress ? {
        quartier: selectedAddress.quartier,
        avenue: selectedAddress.avenue,
        pointDeRepere: selectedAddress.pointDeRepere,
        numeroPorte: selectedAddress.numeroPorte || '',
        etage: selectedAddress.etage || '',
        instructions: selectedAddress.instructions || '',
      } : manualAddress;

      // Save new address if checkbox is checked
      if (!selectedAddress && saveAddressForLater && user) {
        try {
          await addDoc(collection(db, 'addresses'), {
            userId: user.id,
            label: 'home',
            ...addressData,
            isDefault: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } catch (error) {
          console.error('Failed to save address:', error);
          // Don't block order if address save fails
        }
      }

      // Créer/Mettre à jour la commande dans Firestore avec orderReference comme ID
      // ANTI-DUPLICATION: Utilisation de setDoc + merge: true
      const orderData = {
        orderReference,
        userId: user?.id || null,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sizeLabel: item.sizeLabel,
          crustLabel: item.crustLabel,
          extras: item.extras || [],
        })),
        address: addressData,
        contact: {
          fullName: user?.displayName || 'Client',
          phone: currentPhone,
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
        subtotal,
        deliveryFee: DELIVERY_CONFIG.FEE,
        total: subtotal + DELIVERY_CONFIG.FEE,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Utiliser setDoc avec orderReference comme ID + merge: true
      await firestoreWrite(async () => {
        return setDoc(doc(db, 'orders', orderReference), orderData, { merge: true });
      });

      setOrderNumber(orderReference);

      // Clear cart
      clearCart();

      // Move to confirmation step
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show auth warning
  if (showAuthWarning || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md"
          >
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-orange-100">
                  <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
                </div>
                <h2 className="mb-2 text-lg sm:text-xl font-bold text-gray-900">
                  Connexion requise
                </h2>
                <p className="mb-4 text-xs sm:text-sm text-gray-600">
                  Vous devez être connecté pour passer commande.
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Redirection vers la page de connexion...
                </p>
                <div className="mt-6">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="w-full max-w-full px-3 sm:px-4 py-6 sm:py-8 mx-auto">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-colors ${
                      currentStep >= step.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-gray-600">
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 sm:mx-4 h-0.5 w-12 sm:w-20 ${
                      currentStep > step.id ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`w-full max-w-full ${currentStep === 1 ? 'grid gap-6 lg:grid-cols-3' : ''}`}>
          {/* Main Content */}
          <div className={`w-full max-w-full min-w-0 space-y-4 sm:space-y-6 ${currentStep === 1 ? 'lg:col-span-2' : 'max-w-xl mx-auto'}`}>
            <AnimatePresence mode="wait">
              {/* Step 1: Delivery */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    Finaliser ma commande
                  </h1>

                  {/* Phone Section */}
                  <PhoneSection
                    userPhone={user?.phoneNumber || null}
                    currentPhone={currentPhone}
                    onPhoneChange={setCurrentPhone}
                    error={phoneError}
                  />

                  {/* Address Section */}
                  <AddressDeliverySection
                    selectedAddress={selectedAddress}
                    manualAddress={manualAddress}
                    saveForLater={saveAddressForLater}
                    onAddressSelect={setSelectedAddress}
                    onManualAddressChange={setManualAddress}
                    onSaveForLaterChange={setSaveAddressForLater}
                    onModeChange={setIsManualAddressMode}
                    errors={addressErrors}
                  />

                  <Button
                    type="button"
                    onClick={handleStep1Continue}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base"
                    size="lg"
                  >
                    Continuer vers le paiement
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Payment Method Selection Only */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Mode de paiement
                    </h2>
                  </div>

                  {/* Payment Method Selector ONLY */}
                  <Card className="border-0 shadow-sm w-full max-w-full">
                    <CardContent className="p-3 sm:p-4 w-full max-w-full">
                      <PaymentMethodSelector
                        selectedMethod={paymentMethod}
                        onMethodChange={setPaymentMethod}
                      />
                    </CardContent>
                  </Card>

                  {/* Continue to Payment Button */}
                  <div className="flex gap-2 w-full max-w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 min-w-0"
                    >
                      <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Retour</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        // Sauvegarder les infos de livraison pour le paiement
                        const addressData = selectedAddress ? {
                          quartier: selectedAddress.quartier,
                          avenue: selectedAddress.avenue,
                          pointDeRepere: selectedAddress.pointDeRepere,
                          numeroPorte: selectedAddress.numeroPorte || '',
                          etage: selectedAddress.etage || '',
                          instructions: selectedAddress.instructions || '',
                        } : manualAddress;

                        const deliveryInfo = {
                          address: addressData,
                          phone: currentPhone,
                          fullName: user?.displayName || 'Client',
                        };

                        // IMPORTANT: Sauvegarder les infos de livraison ET le panier
                        // pour éviter que le panier soit vide si la page de paiement se recharge
                        const checkoutData = {
                          deliveryInfo,
                          cart: {
                            items: items.map(item => ({
                              productId: item.productId,
                              name: item.name,
                              image: item.image,
                              quantity: item.quantity,
                              unitPrice: item.unitPrice,
                              sizeLabel: item.sizeLabel,
                              crustLabel: item.crustLabel,
                              extras: item.extras,
                            })),
                            subtotal,
                            deliveryFee: DELIVERY_CONFIG.FEE,
                            total: subtotal + DELIVERY_CONFIG.FEE,
                          },
                        };
                        
                        localStorage.setItem('pending_checkout', JSON.stringify(checkoutData));
                        
                        // Garder aussi l'ancien format pour compatibilité
                        localStorage.setItem('pending_delivery_info', JSON.stringify(deliveryInfo));

                        // Rediriger vers la page de paiement correspondante
                        if (paymentMethod === 'card') {
                          router.push('/payment/card');
                        } else if (paymentMethod === 'mobile_money') {
                          router.push('/payment/mobile-money');
                        } else if (paymentMethod === 'cash') {
                          // Pour cash, on peut directement créer la commande
                          handleOrderSubmit();
                        }
                      }}
                      className="flex-1 min-w-0"
                    >
                      <span className="text-xs sm:text-sm truncate">Continuer</span>
                      <ArrowLeft className="ml-1 sm:ml-2 h-4 w-4 rotate-180 flex-shrink-0" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <Card>
                    <CardContent className="p-6 sm:p-8">
                      <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                      </div>
                      <h2 className="mb-2 text-lg sm:text-2xl font-bold text-gray-900">
                        Commande confirmée !
                      </h2>
                      <p className="mb-4 text-xs sm:text-sm text-gray-600">
                        Votre commande <strong>#{orderNumber}</strong> a été reçue.
                      </p>
                      <p className="mb-6 text-xs sm:text-sm text-gray-600">
                        Vous recevrez un appel du livreur sur le <strong>{currentPhone}</strong>
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/account')}
                          className="flex-1"
                        >
                          Mon compte
                        </Button>
                        <Button
                          onClick={() => router.push('/menu')}
                          className="flex-1"
                        >
                          Nouvelle commande
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar - Only on Step 1 */}
          {currentStep === 1 && (
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  isDelivery={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
