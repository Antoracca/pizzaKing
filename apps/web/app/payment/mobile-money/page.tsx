'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Phone, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/providers/CartProvider';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import { DELIVERY_CONFIG } from '@/lib/config';

type MobileMoneyProvider = 'orange' | 'telecel' | null;
type PaymentStep = 'select' | 'confirm' | 'success';

const PROVIDERS = {
  orange: {
    id: 'orange',
    name: 'Orange Money',
    logo: '/orange-money-1280x634.jpg',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-900',
    ussd: '#144*34#',
  },
  telecel: {
    id: 'telecel',
    name: 'Telecel Money',
    logo: '/telecelcash.ebp.webp',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-900',
    ussd: '#111#',
  },
};

// CRITIQUE: orderReference doit être STABLE entre les actualisations!
const getOrCreateOrderReference = (): string => {
  if (typeof window === 'undefined') return `PK${Date.now().toString().slice(-8)}`;
  
  const STORAGE_KEY = 'current_order_reference_mobile';
  const saved = sessionStorage.getItem(STORAGE_KEY);
  
  if (saved) {
    console.log('📦 OrderReference Mobile Money récupéré:', saved);
    return saved;
  }
  
  const newRef = `PK${Date.now().toString().slice(-8)}`;
  sessionStorage.setItem(STORAGE_KEY, newRef);
  console.log('🆕 Nouveau OrderReference Mobile Money créé:', newRef);
  return newRef;
};

export default function MobileMoneyPaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { subtotal, items, clearCart } = useCartContext();

  // Récupérer les données sauvegardées du checkout si le panier est vide
  const [checkoutData, setCheckoutData] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCheckout = localStorage.getItem('pending_checkout');
      if (savedCheckout) {
        try {
          setCheckoutData(JSON.parse(savedCheckout));
        } catch (e) {
          console.error('Erreur parsing checkout data:', e);
        }
      }
    }
  }, []);

  // Utiliser les données sauvegardées si le panier est vide
  const effectiveSubtotal = subtotal > 0 ? subtotal : (checkoutData?.cart?.subtotal || 0);
  const effectiveItems = items.length > 0 ? items : (checkoutData?.cart?.items || []);
  const deliveryFee = DELIVERY_CONFIG.FEE;
  const totalToPay = effectiveSubtotal + deliveryFee;

  const [step, setStep] = useState<PaymentStep>('select');
  const [selectedProvider, setSelectedProvider] = useState<MobileMoneyProvider>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderReference] = useState(() => getOrCreateOrderReference());

  const provider = selectedProvider ? PROVIDERS[selectedProvider] : null;

  const handleProviderSelect = (prov: 'orange' | 'telecel') => {
    setSelectedProvider(prov);
    setStep('confirm');
    setError(null);
  };

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,2}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    if (formatted.replace(/\s/g, '').length <= 8) {
      setPhoneNumber(formatted);
      setError(null);
    }
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 6) {
      setPaymentCode(cleaned);
      setError(null);
    }
  };

  const handlePaymentConfirm = async () => {
    setError(null);

    if (!phoneNumber || phoneNumber.replace(/\s/g, '').length !== 8) {
      setError('Veuillez entrer un numéro valide (8 chiffres)');
      return;
    }

    if (!paymentCode || paymentCode.length !== 6) {
      setError('Le code de paiement doit contenir 6 chiffres');
      return;
    }

    if (!selectedProvider) {
      setError('Fournisseur non sélectionné');
      return;
    }

    setIsProcessing(true);

    try {
      const deliveryInfoStr = localStorage.getItem('pending_delivery_info');
      const deliveryInfo = deliveryInfoStr ? JSON.parse(deliveryInfoStr) : null;

      // Appel à l'API route sécurisée (validation côté serveur)
      const response = await fetch('/api/payments/mobile-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          phoneNumber,
          paymentCode,
          orderReference,
          items: effectiveItems.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            image: item.image ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            sizeLabel: item.sizeLabel ?? null,
            crustLabel: item.crustLabel ?? null,
            extras: item.extras ?? [],
          })),
          subtotal: effectiveSubtotal,
          deliveryFee,
          total: totalToPay,
          userId: user?.id ?? null,
          userEmail: user?.email ?? null,
          userDisplayName: user?.displayName ?? null,
          address: deliveryInfo?.address ?? null,
          contact: {
            fullName: deliveryInfo?.fullName ?? user?.displayName ?? 'Client',
            phone: deliveryInfo?.phone ?? '',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du paiement');
      }

      // Succès!
      localStorage.removeItem('pending_delivery_info');
      localStorage.removeItem('pending_checkout');
      sessionStorage.removeItem('current_order_reference_mobile');
      clearCart();
      setStep('success');

      setTimeout(() => {
        router.push(`/checkout?step=3&order_ref=${orderReference}`);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Erreur lors du paiement. Veuillez réessayer.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setStep('select');
    setSelectedProvider(null);
    setPhoneNumber('');
    setPaymentCode('');
    setError(null);
  };

  // Écran de succès
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white p-12 shadow-2xl text-center">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-green-100 opacity-20 blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-emerald-100 opacity-20 blur-3xl" />
              
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30"
                >
                  <CheckCircle className="h-14 w-14 text-white" strokeWidth={2.5} />
                </motion.div>

                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Paiement réussi !
                </h2>

                <p className="text-lg text-gray-600 mb-2">Montant débité</p>
                <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-8">
                  {totalToPay.toLocaleString()} FCFA
                </p>

                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-medium">Préparation de votre commande...</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <button 
          type="button"
          onClick={() => step === 'confirm' ? handleCancel() : router.back()}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">
            {step === 'confirm' ? 'Pour revenir sur le site du marchand' : 'Retour'}
          </span>
        </button>

        {/* Étape 1: Sélection du provider */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-2">DÉPÔT {orderReference}</h1>
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded">
                  <span className="text-sm font-medium">Types de systèmes de paiement</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p>
                  Pour toutes les questions concernant la collaboration,{' '}
                  écrivez à l'adresse email{' '}
                  <a href="mailto:support@pizzaking.com" className="text-blue-600 underline">
                    support@pizzaking.com
                  </a>
                </p>
              </div>

              {/* Méthodes recommandées */}
              <div className="mb-6">
                <h2 className="text-center text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 bg-gray-200 py-2">
                  MÉTHODES RECOMMANDÉES
                </h2>

                <div className="space-y-3">
                  {/* Orange Money */}
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('orange')}
                    className="w-full bg-white border-2 border-gray-200 hover:border-orange-500 rounded-lg overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="p-4">
                      <div className="relative h-16 w-40 mx-auto">
                        <Image
                          src="/orange-money-1280x634.jpg"
                          alt="Orange Money"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div className="bg-orange-500 text-white py-3 font-medium">
                      Orange
                    </div>
                  </button>

                  {/* Telecel Cash */}
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('telecel')}
                    className="w-full bg-white border-2 border-gray-200 hover:border-red-500 rounded-lg overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="p-4">
                      <div className="relative h-16 w-40 mx-auto">
                        <Image
                          src="/telecelcash.ebp.webp"
                          alt="Telecel Cash"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div className="bg-red-500 text-white py-3 font-medium">
                      Telecel
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Étape 2: Confirmation du paiement */}
        {step === 'confirm' && provider && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header Provider */}
            <div className={`rounded-t-lg p-4 flex items-center justify-between ${
              selectedProvider === 'orange' 
                ? 'bg-orange-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-24">
                  <Image
                    src={provider.logo}
                    alt={provider.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 p-6">
              {/* Votre commande */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Votre commande <span className="text-lg">{orderReference}</span>
                </h2>
                
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Montant</p>
                    <p className="text-2xl font-bold text-gray-900">{totalToPay.toFixed(2)} FCFA</p>
                    <p className="text-sm text-gray-600 mt-1">+Frais: -</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">Montant total: -</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Beneficiaire</p>
                    <p className="text-sm text-gray-900">{new Date().toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Confirmation de paiement */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmation de paiement</h3>

                {/* Numéro de mobile */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Numero de mobile (8 chiffres)*
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="XX XX XX XX"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-orange-500"
                    disabled={isProcessing}
                  />
                </div>

                {/* Code de paiement */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Code de paiement (6 chiffres)*
                  </label>
                  
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900">
                      <p>Obtenez votre code de paiement depuis le menu USSD {provider.name} ou</p>
                      <p className="font-bold mt-1">Composez {provider.ussd}</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={paymentCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-orange-500"
                    disabled={isProcessing}
                  />
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Bouton Confirmer */}
                <Button
                  onClick={handlePaymentConfirm}
                  disabled={isProcessing || !phoneNumber || !paymentCode}
                  className="w-full h-12 text-base font-semibold bg-gray-300 hover:bg-gray-400 text-gray-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Traitement...' : 'Confirmer'}
                </Button>

                {/* QR Code section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm-2 8v8h8v-8H3zm2 6v-4h4v4H5zm8-14v8h8V3h-8zm2 6V5h4v4h-4zm4 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm-2-2h2v2h-2v-2z"/>
                    </svg>
                    <span className="font-medium">J'ai l'application {provider.name} avec Flash QR Code</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Flashez le QR Code et telechargez votre application {provider.name} ici:
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="relative h-10 w-32">
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Google Play"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="relative h-10 w-32">
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                        alt="App Store"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Annuler */}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="w-full mt-4 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Annuler la Transaction
                </button>
              </div>
            </div>

            {/* Footer logo */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative h-8 w-24">
                  <Image
                    src={provider.logo}
                    alt={provider.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Gerer votre argent simplement avec l'application {provider.name}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
