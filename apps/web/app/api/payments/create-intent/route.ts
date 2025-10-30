import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { validatePaymentAmount, validatePaymentMetadata } from '@/lib/server-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Retry helper pour Firebase Admin (version serveur)
async function retryFirestoreOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (attempt === maxRetries) break;

      // Retry seulement pour les erreurs retryables
      const code = error?.code;
      const retryableCodes = ['unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted', 'internal'];
      if (!code || !retryableCodes.includes(code)) {
        throw error;
      }

      // Exponential backoff
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
    }
  }
  throw lastError;
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? null;

const stripeClient =
  stripeSecretKey !== null
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2024-04-10',
      })
    : null;

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

const sanitizeMetadata = (metadata?: Record<string, unknown>) => {
  if (!metadata) return undefined;

  return Object.entries(metadata).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }

    acc[key] = String(value);
    return acc;
  }, {});
};

const normalizeStripeAmount = (amount: number, currency: string) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Montant invalide pour le paiement');
  }

  const lowerCurrency = currency.toLowerCase();
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(lowerCurrency);
  const multiplier = isZeroDecimal ? 1 : 100;

  return Math.round(amount * multiplier);
};

type OrderSnapshot = {
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
};

type CreateIntentPayload = {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  order?: OrderSnapshot;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateIntentPayload;
    const {
      amount,
      currency: requestedCurrency = 'xaf',
      metadata,
      customerEmail,
      order,
    } = body;

    if (!stripeClient) {
      console.error('Stripe client is not configured. Missing STRIPE_SECRET_KEY.');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante sur le serveur' },
        { status: 500 },
      );
    }

    // Validation côté serveur
    const currency = requestedCurrency.toLowerCase();

    const amountValidation = validatePaymentAmount(amount, currency);
    if (!amountValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: amountValidation.errors,
        },
        { status: 400 },
      );
    }

    const metadataValidation = validatePaymentMetadata(metadata || {});
    if (!metadataValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Metadata validation error',
          details: metadataValidation.errors,
        },
        { status: 400 },
      );
    }

    let normalizedAmount: number;
    try {
      normalizedAmount = normalizeStripeAmount(amount, currency);
    } catch (normalizationError) {
      const message =
        normalizationError instanceof Error
          ? normalizationError.message
          : 'Montant invalide pour le paiement';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const sanitizedMetadata = sanitizeMetadata(metadata);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: normalizedAmount,
      currency,
      receipt_email: customerEmail ?? undefined,
      metadata: sanitizedMetadata,
      payment_method_types: ['card'],
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe did not return a client secret');
    }

    // Persist payment intent snapshot avec retry logic
    // IMPORTANT: Cette opération est critique pour le webhook
    try {
      await retryFirestoreOperation(async () => {
        return adminDb
          .collection('payments')
          .doc(paymentIntent.id)
          .set(
            {
              paymentIntentId: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              metadata: paymentIntent.metadata ?? {},
              orderReference: sanitizedMetadata?.orderReference ?? null,
              customerEmail: paymentIntent.receipt_email ?? null,
              order: order ?? null,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
      });
      console.log(`✅ Payment intent ${paymentIntent.id} persisted successfully`);
    } catch (firestoreError) {
      // Log l'erreur mais ne pas bloquer le flux
      // Le webhook peut toujours fonctionner
      console.error('❌ CRITICAL: Failed to persist payment intent after retries:', {
        paymentIntentId: paymentIntent.id,
        error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError),
      });
      // Continuer quand même - le client peut toujours payer
    }

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('❌ Stripe create intent error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      amount,
      currency,
    });

    // Déterminer le code de statut approprié
    let statusCode = 500;
    let errorMessage = 'Erreur inconnue lors de la création du paiement';

    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = error.message;
      // Erreurs Stripe spécifiques
      if (error.type === 'StripeCardError') {
        statusCode = 400;
      } else if (error.type === 'StripeInvalidRequestError') {
        statusCode = 400;
      } else if (error.type === 'StripeAPIError') {
        statusCode = 503; // Service Unavailable
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode },
    );
  }
}
