'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type {
  StripeCardNumberElement,
  StripeCardNumberElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardCvcElementChangeEvent,
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartContext } from '@/providers/CartProvider';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import { getStripe } from '@/lib/stripe';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DELIVERY_CONFIG } from '@/lib/config';
import { firestoreWrite } from '@/lib/firebase-retry';

const VisaIcon = () => (
  <div className="relative h-full w-full bg-white rounded flex items-center justify-center shadow-sm">
    <Image
      src="https://www.svgrepo.com/show/328144/visa.svg"
      alt="Visa"
      fill
      className="object-contain p-1"
      unoptimized
      style={{ opacity: 1 }}
    />
  </div>
);

const MastercardIcon = () => (
  <div className="relative h-full w-full bg-white rounded flex items-center justify-center shadow-sm">
    <Image
      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
      alt="Mastercard"
      fill
      className="object-contain p-1"
      unoptimized
      style={{ opacity: 1 }}
    />
  </div>
);

const AmexIcon = () => (
  <div className="relative h-full w-full bg-white rounded flex items-center justify-center shadow-sm">
    <Image
      src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
      alt="American Express"
      fill
      className="object-contain p-1"
      unoptimized
      style={{ opacity: 1 }}
    />
  </div>
);

const GimacIcon = () => (
  <div className="flex h-full w-full items-center justify-center rounded bg-green-600 shadow-sm">
    <span className="text-sm font-bold text-white">GIMAC</span>
  </div>
);

const DefaultCardIcon = () => (
  <div className="flex h-full w-full items-center justify-center rounded bg-white">
    <CreditCard className="h-6 w-6 text-gray-600" />
  </div>
);

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'unknown';
type AcceptedBrand = CardBrand | 'gimac';

const CARD_BRAND_CONFIG: Record<AcceptedBrand, { label: string; colorStart: string; colorEnd: string; icon: React.FC }> = {
  visa: {
    label: 'Visa',
    colorStart: '#1A1F71',
    colorEnd: '#0D47A1',
    icon: VisaIcon,
  },
  mastercard: {
    label: 'Mastercard',
    colorStart: '#EB001B',
    colorEnd: '#F79E1B',
    icon: MastercardIcon,
  },
  amex: {
    label: 'American Express',
    colorStart: '#006FCF',
    colorEnd: '#003D71',
    icon: AmexIcon,
  },
  discover: {
    label: 'Discover',
    colorStart: '#FF6000',
    colorEnd: '#FF9500',
    icon: DefaultCardIcon,
  },
  diners: {
    label: 'Diners Club',
    colorStart: '#0079BE',
    colorEnd: '#003D5C',
    icon: DefaultCardIcon,
  },
  jcb: {
    label: 'JCB',
    colorStart: '#003DA5',
    colorEnd: '#0071BC',
    icon: DefaultCardIcon,
  },
  unionpay: {
    label: 'UnionPay',
    colorStart: '#E21836',
    colorEnd: '#00447C',
    icon: DefaultCardIcon,
  },
  unknown: {
    label: 'Carte bancaire',
    colorStart: '#6B7280',
    colorEnd: '#4B5563',
    icon: DefaultCardIcon,
  },
  gimac: {
    label: 'GIMAC',
    colorStart: '#00A651',
    colorEnd: '#008741',
    icon: GimacIcon,
  },
};

const ACCEPTED_BRANDS: AcceptedBrand[] = ['visa', 'mastercard', 'amex', 'gimac'];

const formatCardNumber = (value: string) => {
  if (!value) return '•••• •••• •••• ••••';
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  const formatted = groups.join(' ');
  const remaining = 16 - cleaned.length;
  const dots = '•'.repeat(Math.max(0, remaining));
  return (formatted + dots.replace(/(.{4})/g, ' $1')).trim().substring(0, 19);
};

const getOrCreateOrderReference = (): string => {
  if (typeof window === 'undefined') return `PK${Date.now().toString().slice(-8)}`;
  
  const STORAGE_KEY = 'current_order_reference_card';
  const saved = sessionStorage.getItem(STORAGE_KEY);
  
  if (saved) {
    console.log('📦 OrderReference récupéré:', saved);
    return saved;
  }
  
  const newRef = `PK${Date.now().toString().slice(-8)}`;
  sessionStorage.setItem(STORAGE_KEY, newRef);
  console.log('🆕 Nouveau OrderReference créé:', newRef);
  return newRef;
};

export default function CardPaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { subtotal, items, clearCart, isHydrated } = useCartContext();

  // États initiaux
  const [checkoutDataRaw, setCheckoutDataRaw] = useState<any>(null);
  const [isCheckoutDataLoaded, setIsCheckoutDataLoaded] = useState(false); // ← Nouveau flag
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isIntentLoading, setIsIntentLoading] = useState(true);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [focusedField, setFocusedField] = useState<'number' | 'expiry' | 'cvc' | null>(null);
  const [intentRetry, setIntentRetry] = useState(0);
  const [orderReference] = useState(() => getOrCreateOrderReference());
  const [intentCreated, setIntentCreated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🔒 VERROU SYNCHRONE avec useRef au lieu de useState
  const isCreatingRef = useRef(false);
  const creationInProgressRef = useRef(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCheckout = localStorage.getItem('pending_checkout');
      if (savedCheckout) {
        try {
          const parsed = JSON.parse(savedCheckout);
          setCheckoutDataRaw(parsed);
          console.log('✅ Données de checkout chargées depuis localStorage:', parsed);
        } catch (e) {
          console.error('❌ Erreur parsing checkout data:', e);
        }
      } else {
        console.log('⚠️ Pas de données pending_checkout dans localStorage');
      }
      // Marquer comme chargé dans tous les cas (même si vide)
      setIsCheckoutDataLoaded(true);
    }
  }, []);

  // 🎯 MÉMORISER checkoutData pour éviter les changements de référence
  const checkoutData = useMemo(() => checkoutDataRaw, [
    checkoutDataRaw?.cart?.items?.length,
    checkoutDataRaw?.cart?.subtotal,
    checkoutDataRaw?.cart?.total,
    checkoutDataRaw?.deliveryInfo?.phone, // ← Suivre aussi deliveryInfo
  ]);

  const effectiveSubtotal = subtotal > 0 ? subtotal : (checkoutData?.cart?.subtotal || 0);
  const effectiveItems = items.length > 0 ? items : (checkoutData?.cart?.items || []);
  const deliveryFee = DELIVERY_CONFIG.FEE;
  const totalToPay = effectiveSubtotal + deliveryFee;

  console.log('🎯 RENDER CardPaymentPage', {
    subtotal,
    itemsLength: items.length,
    hasCheckoutData: !!checkoutData,
    checkoutDataItems: checkoutData?.cart?.items?.length || 0,
    effectiveSubtotal,
    effectiveItemsLength: effectiveItems.length,
    totalToPay,
    isHydrated,
    orderReference,
  });

  // 🔴 PROTECTION: Si vraiment aucune donnée, rediriger vers le panier
  useEffect(() => {
    if (mounted && !isIntentLoading) {
      const hasAnyData = 
        items.length > 0 || 
        (checkoutData && checkoutData.cart?.items?.length > 0) ||
        clientSecret;
      
      if (!hasAnyData) {
        console.log('❌ Aucune donnée disponible, redirection vers panier');
        router.push('/cart');
      }
    }
  }, [mounted, items.length, checkoutData, clientSecret, isIntentLoading, router]);

  // ✅ Ne charger Stripe que côté client (pas pendant le build SSR)
  const stripePromise = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getStripe();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Récupération du PaymentIntent depuis la session au montage
  useEffect(() => {
    if (typeof window !== 'undefined' && orderReference && totalToPay > 0) {
      const saved = sessionStorage.getItem(`payment_intent_${orderReference}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          console.log('📦 PaymentIntent trouvé en session:', data);

          // ✅ VALIDATION: Vérifier que le montant correspond toujours
          const savedAmount = data.amount;
          const currentAmount = totalToPay; // Montant en FCFA

          if (savedAmount && Math.abs(savedAmount - currentAmount) < 1) {
            // Le montant correspond, on peut réutiliser l'intent
            if (data.clientSecret && typeof data.clientSecret === 'string') {
              setClientSecret(data.clientSecret);
              setIntentCreated(true);
              setIsIntentLoading(false);
              isCreatingRef.current = true; // Marquer comme déjà créé
              console.log('✅ PaymentIntent récupéré et validé');
              return;
            }
          } else {
            // Le montant a changé, nettoyer l'ancien intent
            console.log('⚠️ Montant changé, nettoyage de l\'ancien intent', {
              saved: savedAmount,
              current: currentAmount
            });
            sessionStorage.removeItem(`payment_intent_${orderReference}`);
          }
        } catch (e) {
          console.error('❌ Erreur parsing saved intent:', e);
          sessionStorage.removeItem(`payment_intent_${orderReference}`);
        }
      }

      // Si pas de session valide, on indique qu'on doit créer un intent
      console.log('📝 Pas de PaymentIntent en session, création nécessaire');
      setIntentCreated(false);
      setIsIntentLoading(true);
    }
  }, [orderReference, totalToPay]);

  // Création du PaymentIntent si nécessaire
  useEffect(() => {
    let cancelled = false;

    const createIntent = async () => {
      // 🔒 VERROU #1: Vérifier avec useRef (synchrone)
      if (creationInProgressRef.current) {
        console.log('⏳ Création déjà en cours (verrou actif)');
        return;
      }

      // Si on a déjà un clientSecret valide, on ne fait rien
      if (clientSecret && intentCreated) {
        console.log('✅ ClientSecret déjà présent, pas de création');
        return;
      }

      // 🔒 VERROU #2: Vérifier si déjà créé
      if (isCreatingRef.current || intentCreated) {
        console.log('⏳ Intent déjà créé ou marqué comme créé');
        return;
      }

      console.log('🚀 Début création PaymentIntent');

      // 🔒 ACTIVER LES VERROUS IMMÉDIATEMENT (synchrone)
      creationInProgressRef.current = true;
      isCreatingRef.current = true;

      setIsIntentLoading(true);
      setIntentError(null);

      try {
        // 📦 Récupérer les infos de livraison depuis checkoutData
        const deliveryInfo = checkoutData?.deliveryInfo;

        if (!deliveryInfo) {
          throw new Error('Données de livraison manquantes. Veuillez retourner au checkout.');
        }

        const orderSnapshot = {
          items: effectiveItems.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            sizeLabel: item.sizeLabel ?? null,
            crustLabel: item.crustLabel ?? null,
            extras: item.extras ?? [],
            image: item.image ?? null,
          })),
          subtotal: effectiveSubtotal,
          deliveryFee,
          total: totalToPay,
          userId: user?.id ?? null,
          userEmail: user?.email ?? null,
          userDisplayName: user?.displayName ?? null,
          // ✅ AJOUTER les infos de livraison
          address: deliveryInfo.address,
          contact: {
            fullName: deliveryInfo.fullName || user?.displayName || 'Client',
            phone: deliveryInfo.phone,
          },
        };

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalToPay,
            currency: 'xaf',
            customerEmail: user?.email ?? undefined,
            metadata: {
              orderReference,
              userId: user?.id ?? 'guest',
              itemCount: String(effectiveItems.length),
              subtotal: String(effectiveSubtotal),
              deliveryFee: String(deliveryFee),
            },
            order: orderSnapshot,
          }),
        });

        const data = await response.json();
        console.log('📡 Réponse API:', data);

        if (!response.ok || !data?.clientSecret) {
          throw new Error(data?.error || 'Impossible de préparer le paiement');
        }

        if (!cancelled) {
          setClientSecret(data.clientSecret as string);
          setIntentCreated(true);

          // Sauvegarder en session avec le montant pour validation future
          sessionStorage.setItem(
            `payment_intent_${orderReference}`,
            JSON.stringify({
              clientSecret: data.clientSecret,
              paymentIntentId: data.paymentIntentId,
              amount: totalToPay, // ← Sauvegarder le montant en FCFA
              createdAt: Date.now(),
            })
          );
          console.log('✅ PaymentIntent créé et sauvegardé:', data.paymentIntentId);
        }
      } catch (error) {
        console.error('❌ Erreur création intent:', error);
        if (!cancelled) {
          setIntentError(
            error instanceof Error ? error.message : 'Erreur lors de la préparation du paiement'
          );
          // 🔒 DÉVERROUILLER en cas d'erreur
          creationInProgressRef.current = false;
          isCreatingRef.current = false;
        }
      } finally {
        if (!cancelled) {
          setIsIntentLoading(false);
          // 🔒 Libérer le verrou de création en cours
          creationInProgressRef.current = false;
        }
      }
    };

    // ✅ ATTENDRE que localStorage soit lu avant de continuer
    if (!isCheckoutDataLoaded) {
      console.log('⏳ Chargement des données depuis localStorage...');
      return;
    }

    // Attendre que les données soient prêtes
    const hasData = (isHydrated && effectiveItems.length > 0) ||
                    (checkoutData && checkoutData.cart?.items?.length > 0);

    // ✅ Vérifier aussi que deliveryInfo est présent
    const hasDeliveryInfo = checkoutData?.deliveryInfo?.phone && checkoutData?.deliveryInfo?.address;

    if (!hasData) {
      console.log('⏳ En attente des données du panier...', {
        isHydrated,
        hasCheckoutData: !!checkoutData,
        itemsLength: effectiveItems.length
      });

      // Si on n'a pas de données après 3 secondes, afficher une erreur
      setTimeout(() => {
        if (!hasData && !clientSecret) {
          setIntentError('Votre panier est vide ou les données ne sont pas disponibles');
          setIsIntentLoading(false);
        }
      }, 3000);
      return;
    }

    if (!hasDeliveryInfo && !clientSecret) {
      console.log('⏳ En attente des données de livraison...', {
        hasCheckoutData: !!checkoutData,
        hasDeliveryInfo: !!checkoutData?.deliveryInfo,
        hasPhone: !!checkoutData?.deliveryInfo?.phone,
        hasAddress: !!checkoutData?.deliveryInfo?.address,
      });

      // Si on n'a pas de deliveryInfo après 3 secondes, afficher une erreur
      setTimeout(() => {
        if (!hasDeliveryInfo && !clientSecret) {
          setIntentError('Données de livraison manquantes. Veuillez retourner au checkout.');
          setIsIntentLoading(false);
        }
      }, 3000);
      return;
    }

    if (totalToPay > 0 && effectiveItems.length > 0 && !clientSecret && !intentCreated) {
      console.log('💳 Lancement création PaymentIntent', {
        totalToPay,
        itemsCount: effectiveItems.length,
        orderReference
      });
      createIntent();
    } else if (totalToPay <= 0 || effectiveItems.length === 0) {
      setIntentError('Votre panier est vide');
      setIsIntentLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [
    // ✅ Utiliser uniquement des VALEURS PRIMITIVES (pas d'objets!)
    isCheckoutDataLoaded, // ← IMPORTANT: Attendre que localStorage soit lu
    isHydrated,
    totalToPay,
    effectiveItems.length, // ← Longueur du tableau, pas le tableau complet
    effectiveSubtotal,
    deliveryFee,
    user?.email,
    user?.id,
    orderReference,
    intentRetry,
    clientSecret,
    intentCreated,
    // checkoutData retiré car c'est un objet mémorisé
  ]);

  const handleSuccess = useCallback(
    async (paymentIntentId: string) => {
      setPaymentSuccess(true);

      // ✅ OPTION C: Le webhook Stripe crée la commande
      // On nettoie juste le panier et on redirige
      console.log('✅ Paiement réussi! Le webhook Stripe va créer la commande.');
      
      // Nettoyer les données de session
      sessionStorage.removeItem(`payment_intent_${orderReference}`);
      sessionStorage.removeItem('current_order_reference_card');
      
      // Nettoyer le panier
      clearCart();
      
      // ⚠️ NE PAS supprimer pending_checkout ici!
      // Il sera supprimé uniquement sur la page de confirmation finale
      // Sinon impossible de faire une 2ème commande sans recharger la page

      // Attendre 2 secondes que le webhook crée la commande
      setTimeout(() => {
        router.push(`/checkout?step=3&payment_intent=${paymentIntentId}&order_ref=${orderReference}`);
      }, 2000);
    },
    [orderReference, clearCart, router]
  );

  // Fonction pour réessayer la création du PaymentIntent
  const handleRetry = () => {
    console.log('🔄 Réessai de création du PaymentIntent');
    // Nettoyer l'état et la session
    sessionStorage.removeItem(`payment_intent_${orderReference}`);
    setClientSecret(null);
    setIntentCreated(false);
    setIntentError(null);
    setIsIntentLoading(true);

    // 🔒 Réinitialiser les verrous
    isCreatingRef.current = false;
    creationInProgressRef.current = false;

    setIntentRetry(prev => prev + 1);
  };

  if (!mounted) {
    return null;
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto max-w-md text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Paiement réussi !</h1>
            <p className="text-gray-600">
              Votre commande a été enregistrée. Redirection en cours...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret ?? undefined,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#f97316',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
    locale: 'fr',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/checkout?step=2')}
          className="mb-6 flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour au checkout
        </button>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <h1 className="mb-6 text-3xl font-bold text-gray-900">Paiement par carte</h1>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Récapitulatif</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{effectiveSubtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-orange-600">{totalToPay.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-sm text-green-900">
                <Lock className="h-4 w-4" />
                <span className="font-medium">Paiement 100% sécurisé</span>
              </div>
              <p className="mt-1 text-xs text-green-800">
                Vos données sont cryptées et protégées par Stripe
              </p>
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                {isIntentLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                    <p className="text-gray-600">Préparation du paiement...</p>
                    <p className="mt-2 text-xs text-gray-500">Cela peut prendre quelques secondes</p>
                  </div>
                )}

                {intentError && (
                  <div className="rounded-lg bg-red-50 p-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-medium">Erreur</p>
                    </div>
                    <p className="mt-2 text-sm text-red-700">{intentError}</p>
                    <Button
                      onClick={handleRetry}
                      className="mt-4"
                      variant="outline"
                    >
                      Réessayer
                    </Button>
                  </div>
                )}

                {clientSecret && !isIntentLoading && !intentError && (
                  <Elements key={clientSecret} stripe={stripePromise} options={elementsOptions}>
                    <CheckoutForm
                      clientSecret={clientSecret}
                      totalToPay={totalToPay}
                      onSuccess={handleSuccess}
                      userEmail={user?.email ?? null}
                    />
                  </Elements>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CheckoutFormProps {
  clientSecret: string;
  totalToPay: number;
  onSuccess: (paymentIntentId: string) => void;
  userEmail: string | null;
}

const CARD_NUMBER_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

const CARD_GENERIC_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

function CheckoutForm({ clientSecret, totalToPay, onSuccess, userEmail }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cardholderName, setCardholderName] = useState('');
  const [detectedBrand, setDetectedBrand] = useState<AcceptedBrand>('unknown');
  const [liveNumber, setLiveNumber] = useState('');
  const [liveExpiry, setLiveExpiry] = useState('');
  const [liveCvc, setLiveCvc] = useState('');
  const [focusedField, setFocusedField] = useState<'number' | 'expiry' | 'cvc' | null>(null);

  const [numberComplete, setNumberComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);

  const [numberError, setNumberError] = useState<string | null>(null);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [cvcError, setCvcError] = useState<string | null>(null);

  const updateCompletion = useCallback(
    (num: boolean, exp: boolean, cvc: boolean) => {
      console.log('Form completion:', { num, exp, cvc });
    },
    []
  );

  const handleNumberChange = useCallback(
    (event: StripeCardNumberElementChangeEvent) => {
      setSubmitError(null);

      if (event.brand) {
        const brandMap: Record<string, AcceptedBrand> = {
          visa: 'visa',
          mastercard: 'mastercard',
          amex: 'amex',
          discover: 'discover',
          diners: 'diners',
          jcb: 'jcb',
          unionpay: 'unionpay',
          unknown: 'unknown',
        };
        setDetectedBrand(brandMap[event.brand] || 'unknown');
      }

      if (event.complete) {
        setLiveNumber('•••• •••• •••• ••••');
      } else if (event.empty) {
        setLiveNumber('');
      } else {
        setLiveNumber('•••• ••••');
      }

      setNumberComplete(event.complete);
      setNumberError(event.error?.message ?? null);
      updateCompletion(event.complete, expiryComplete, cvcComplete);
    },
    [cvcComplete, expiryComplete, updateCompletion]
  );

  const handleExpiryChange = useCallback(
    (event: StripeCardExpiryElementChangeEvent) => {
      setSubmitError(null);

      if (event.complete) {
        setLiveExpiry('••/••');
      } else if (event.empty) {
        setLiveExpiry('');
      } else {
        setLiveExpiry('••');
      }

      setExpiryComplete(event.complete);
      setExpiryError(event.error?.message ?? null);
      updateCompletion(numberComplete, event.complete, cvcComplete);
    },
    [cvcComplete, numberComplete, updateCompletion]
  );

  const handleCvcChange = useCallback(
    (event: StripeCardCvcElementChangeEvent) => {
      setSubmitError(null);

      if (event.complete) {
        setLiveCvc('•••');
      } else if (event.empty) {
        setLiveCvc('');
      } else {
        setLiveCvc('•');
      }

      setCvcComplete(event.complete);
      setCvcError(event.error?.message ?? null);
      updateCompletion(numberComplete, expiryComplete, event.complete);
    },
    [expiryComplete, numberComplete, updateCompletion]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitError(null);

      if (!stripe || !elements) {
        setSubmitError("Stripe n'est pas prêt. Veuillez recharger la page.");
        return;
      }

      if (!cardholderName.trim()) {
        setSubmitError('Nom du titulaire requis');
        return;
      }

      if (!(numberComplete && expiryComplete && cvcComplete)) {
        setSubmitError('Veuillez compléter toutes les informations');
        return;
      }

      const cardNumberElement = elements.getElement(CardNumberElement) as StripeCardNumberElement | null;

      if (!cardNumberElement) {
        setSubmitError('Impossible de récupérer le formulaire de carte.');
        return;
      }

      setIsProcessing(true);

      try {
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: cardholderName.trim(),
              email: userEmail ?? undefined,
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message || 'Le paiement a été refusé');
        }

        if (
          result.paymentIntent &&
          (result.paymentIntent.status === 'succeeded' ||
            result.paymentIntent.status === 'processing' ||
            result.paymentIntent.status === 'requires_capture')
        ) {
          onSuccess(result.paymentIntent.id);
          return;
        }

        throw new Error(`Paiement non confirmé (statut: ${result.paymentIntent?.status ?? 'inconnu'})`);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Une erreur inattendue est survenue'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [
      cardholderName,
      clientSecret,
      cvcComplete,
      elements,
      expiryComplete,
      numberComplete,
      onSuccess,
      stripe,
      userEmail,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Nous acceptons : Visa, Mastercard, American Express, GIMAC
        </p>
        <div className="flex items-center gap-3">
          {ACCEPTED_BRANDS.map(brand => {
            const Icon = CARD_BRAND_CONFIG[brand].icon;
            const isSelected = detectedBrand === brand;
            return (
              <div
                key={brand}
                className={`h-12 w-16 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-orange-500 shadow-md' 
                    : 'border-gray-300 opacity-70'
                }`}
              >
                <Icon />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du titulaire
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={e => {
            setCardholderName(e.target.value.toUpperCase());
            setSubmitError(null);
          }}
          onFocus={() => setFocusedField(null)}
          placeholder="JEAN DUPONT"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-50"
          disabled={isProcessing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de carte
        </label>
        <div
          className={`rounded-lg border px-4 py-3 transition ${
            numberError
              ? 'border-red-500'
              : 'border-gray-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20'
          }`}
        >
          <CardNumberElement
            options={CARD_NUMBER_OPTIONS}
            onChange={handleNumberChange}
            onFocus={() => setFocusedField('number')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
        {numberError && (
          <p className="mt-2 text-sm text-red-600">{numberError}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date d'expiration
          </label>
          <div
            className={`rounded-lg border px-4 py-3 transition ${
              expiryError
                ? 'border-red-500'
                : 'border-gray-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20'
            }`}
          >
            <CardExpiryElement
              options={CARD_GENERIC_OPTIONS}
              onChange={handleExpiryChange}
              onFocus={() => setFocusedField('expiry')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          {expiryError && (
            <p className="mt-2 text-sm text-red-600">{expiryError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <div
            className={`rounded-lg border px-4 py-3 transition ${
              cvcError
                ? 'border-red-500'
                : 'border-gray-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20'
            }`}
          >
            <CardCvcElement
              options={CARD_GENERIC_OPTIONS}
              onChange={handleCvcChange}
              onFocus={() => setFocusedField('cvc')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          {cvcError && (
            <p className="mt-2 text-sm text-red-600">{cvcError}</p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          className="h-12 w-full text-base font-semibold"
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Traitement...
            </>
          ) : (
            `Payer ${totalToPay.toLocaleString()} FCFA`
          )}
        </Button>
      </div>
    </form>
  );
}