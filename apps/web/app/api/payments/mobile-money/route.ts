import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { 
  validatePaymentAmount, 
  validateOrderItems,
  validateAddress,
  validateContact,
  validateOrderAmounts
} from '@/lib/server-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type MobileMoneyProvider = 'orange' | 'telecel';

type CreateMobileMoneyOrderPayload = {
  provider: MobileMoneyProvider;
  phoneNumber: string;
  paymentCode: string;
  orderReference: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    sizeLabel?: string | null;
    crustLabel?: string | null;
    extras?: string[];
    image?: string | null;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  userId?: string | null;
  userEmail?: string | null;
  userDisplayName?: string | null;
  address?: any;
  contact?: any;
};

/**
 * SIMULATION: Validation du paiement Mobile Money
 * 
 * ⚠️ IMPORTANT: Ceci est une simulation pour le développement!
 * En production, vous devez intégrer les vraies API:
 * 
 * Orange Money API: https://developer.orange.com/apis/orange-money-webpay
 * Telecel API: Documentation propre à Telecel Centrafrique
 * 
 * Les vraies API permettent de:
 * 1. Initier un paiement (retourne un transactionId)
 * 2. Vérifier le statut du paiement
 * 3. Confirmer le paiement avec callback webhook
 */
async function validateMobileMoneyPayment(
  provider: MobileMoneyProvider,
  phoneNumber: string,
  paymentCode: string,
  amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  
  // SIMULATION: En production, remplacer par appel API réel
  console.log('🔄 SIMULATION: Validation paiement Mobile Money', {
    provider,
    phoneNumber,
    amount,
    // Ne jamais logger le code de paiement réel en production!
  });

  // SIMULATION: Délai réseau (comme un vrai appel API)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // SIMULATION: Accepter n'importe quel code à 6 chiffres
  // En production: l'API du fournisseur vérifie le vrai code PIN
  
  // Pour démonstration: quelques codes qui simulent des erreurs
  if (paymentCode === '111111') {
    return {
      success: false,
      error: 'Code PIN incorrect. Veuillez réessayer.',
    };
  }

  if (paymentCode === '222222') {
    return {
      success: false,
      error: 'Solde insuffisant. Veuillez recharger votre compte.',
    };
  }

  if (paymentCode === '333333') {
    return {
      success: false,
      error: 'Transaction annulée par l\'utilisateur.',
    };
  }

  // TOUS LES AUTRES CODES: Succès (pour faciliter les tests)
  return {
    success: true,
    transactionId: `${provider.toUpperCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateMobileMoneyOrderPayload;

    // ========================================
    // 1. VALIDATION DES DONNÉES
    // ========================================

    if (!body.provider || !['orange', 'telecel'].includes(body.provider)) {
      return NextResponse.json(
        { error: 'Fournisseur Mobile Money invalide' },
        { status: 400 }
      );
    }

    if (!body.phoneNumber || body.phoneNumber.replace(/\s/g, '').length !== 8) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide (8 chiffres requis)' },
        { status: 400 }
      );
    }

    if (!body.paymentCode || body.paymentCode.length !== 6) {
      return NextResponse.json(
        { error: 'Code de paiement invalide (6 chiffres requis)' },
        { status: 400 }
      );
    }

    // Validation des montants
    const amountValidation = validatePaymentAmount(body.total, 'xaf');
    if (!amountValidation.isValid) {
      return NextResponse.json(
        { error: 'Montant invalide', details: amountValidation.errors },
        { status: 400 }
      );
    }

    // Validation des items
    const itemsValidation = validateOrderItems(body.items);
    if (!itemsValidation.isValid) {
      return NextResponse.json(
        { error: 'Articles invalides', details: itemsValidation.errors },
        { status: 400 }
      );
    }

    // Validation de l'adresse
    if (body.address) {
      const addressValidation = validateAddress(body.address);
      if (!addressValidation.isValid) {
        return NextResponse.json(
          { error: 'Adresse invalide', details: addressValidation.errors },
          { status: 400 }
        );
      }
    }

    // Validation du contact
    if (body.contact) {
      const contactValidation = validateContact(body.contact);
      if (!contactValidation.isValid) {
        return NextResponse.json(
          { error: 'Contact invalide', details: contactValidation.errors },
          { status: 400 }
        );
      }
    }

    // Validation des montants (subtotal + deliveryFee = total)
    const amountsValidation = validateOrderAmounts(
      body.subtotal,
      body.deliveryFee,
      body.total
    );
    if (!amountsValidation.isValid) {
      return NextResponse.json(
        { error: 'Montants incohérents', details: amountsValidation.errors },
        { status: 400 }
      );
    }

    // ========================================
    // 2. RECALCUL DES PRIX (SÉCURITÉ CRITIQUE!)
    // ========================================
    
    // En production: récupérer les vrais prix depuis la base de données
    // pour éviter que le client manipule les prix
    let serverSubtotal = 0;
    for (const item of body.items) {
      // TODO: Récupérer le vrai prix depuis la DB
      // const product = await adminDb.collection('products').doc(item.productId).get();
      // const realPrice = product.data()?.price || 0;
      
      // Pour l'instant, on fait confiance au client (TEMPORAIRE!)
      serverSubtotal += item.unitPrice * item.quantity;
    }

    const serverDeliveryFee = body.deliveryFee; // Devrait être validé selon les règles
    const serverTotal = serverSubtotal + serverDeliveryFee;

    // Vérifier que les prix correspondent
    if (Math.abs(serverTotal - body.total) > 0.01) {
      console.error('❌ PRIX MANIPULÉ!', {
        clientTotal: body.total,
        serverTotal,
        difference: Math.abs(serverTotal - body.total),
      });
      
      return NextResponse.json(
        { error: 'Erreur de calcul. Veuillez réessayer.' },
        { status: 400 }
      );
    }

    // ========================================
    // 3. VALIDATION DU PAIEMENT MOBILE MONEY
    // ========================================

    const paymentResult = await validateMobileMoneyPayment(
      body.provider,
      body.phoneNumber,
      body.paymentCode,
      body.total
    );

    if (!paymentResult.success) {
      return NextResponse.json(
        { 
          error: paymentResult.error || 'Paiement refusé',
          code: 'PAYMENT_FAILED'
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // ========================================
    // 4. CRÉATION DE LA COMMANDE (SEULEMENT SI PAYÉ!)
    // ========================================

    const orderData = {
      orderReference: body.orderReference,
      paymentStatus: 'paid', // ✅ Marqué paid SEULEMENT après vérification
      paymentMethod: 'mobile_money',
      mobileMoneyProvider: body.provider,
      mobileMoneyPhone: body.phoneNumber,
      mobileMoneyTransactionId: paymentResult.transactionId,
      amount: serverTotal,
      currency: 'xaf',
      items: body.items,
      subtotal: serverSubtotal,
      deliveryFee: serverDeliveryFee,
      total: serverTotal,
      userId: body.userId ?? null,
      userEmail: body.userEmail ?? null,
      userDisplayName: body.userDisplayName ?? null,
      address: body.address ?? null,
      contact: body.contact ?? null,
      status: 'paid',
      paidAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Utiliser orderReference comme ID pour éviter les doublons
    await adminDb
      .collection('orders')
      .doc(body.orderReference)
      .set(orderData, { merge: true });

    console.log('✅ Commande Mobile Money créée:', body.orderReference);

    // ========================================
    // 5. RÉPONSE DE SUCCÈS
    // ========================================

    return NextResponse.json(
      {
        success: true,
        orderReference: body.orderReference,
        transactionId: paymentResult.transactionId,
        amount: serverTotal,
        message: 'Paiement validé et commande créée',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Erreur API Mobile Money:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors du traitement du paiement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
