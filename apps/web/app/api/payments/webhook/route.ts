import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? null;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-04-10',
});

type StoredOrderSnapshot = {
  items?: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    sizeLabel?: string | null;
    crustLabel?: string | null;
    extras?: string[];
    image?: string | null;
  }>;
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  userId?: string | null;
  userEmail?: string | null;
  userDisplayName?: string | null;
  // ✅ AJOUTER les types pour address et contact
  address?: {
    quartier: string;
    avenue: string;
    pointDeRepere: string;
    numeroPorte?: string;
    etage?: string;
    instructions?: string;
  } | null;
  contact?: {
    fullName: string;
    phone: string;
  } | null;
};

type PaymentIntentWithCharges = Stripe.PaymentIntent & {
  charges?: Stripe.ApiList<Stripe.Charge>;
};

const upsertPaymentRecord = async (
  paymentIntent: PaymentIntentWithCharges,
  extra: Record<string, unknown> = {},
) => {
  try {
    await adminDb
      .collection('payments')
      .doc(paymentIntent.id)
      .set(
        {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerEmail: paymentIntent.receipt_email ?? null,
          metadata: paymentIntent.metadata ?? {},
          charges:
            paymentIntent.charges?.data?.map((charge: Stripe.Charge) => ({
              id: charge.id,
              status: charge.status,
              outcome: charge.outcome ?? null,
              amount: charge.amount,
              currency: charge.currency,
              paymentMethodDetails: charge.payment_method_details ?? null,
            })) ?? [],
          updatedAt: FieldValue.serverTimestamp(),
          ...extra,
        },
        { merge: true },
      );
  } catch (error) {
    console.error('Failed to upsert payment record:', error);
    throw error;
  }
};

const createOrUpdateOrder = async (
  paymentIntent: PaymentIntentWithCharges,
  status: 'paid' | 'failed' | 'processing',
) => {
  const paymentRef = adminDb.collection('payments').doc(paymentIntent.id);
  const paymentSnapshot = await paymentRef.get();
  const storedData = paymentSnapshot.data() ?? {};
  const orderSnapshot = (storedData.order as StoredOrderSnapshot | null) ?? null;

  if (!orderSnapshot) {
    return;
  }

  const orderReference =
    (paymentIntent.metadata?.orderReference as string | undefined) ||
    (storedData.orderReference as string | undefined) ||
    paymentIntent.id;

  const orderDoc = adminDb.collection('orders').doc(orderReference);

  // Vérifier si le document existe déjà pour gérer createdAt
  const existingOrder = await orderDoc.get();
  const isNewOrder = !existingOrder.exists;

  // ANTI-DUPLICATION: Utilisation de orderReference comme ID + merge: true
  // Cela garantit qu'une seule commande est créée même si le client et le webhook
  // essaient de créer la commande simultanément
  await orderDoc.set(
    {
      orderReference,
      paymentIntentId: paymentIntent.id,
      paymentStatus: status,
      paymentMethod: 'card', // Webhook = toujours carte bancaire
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      items: orderSnapshot.items ?? [],
      subtotal: orderSnapshot.subtotal ?? null,
      deliveryFee: orderSnapshot.deliveryFee ?? null,
      total: orderSnapshot.total ?? null,
      userId:
        orderSnapshot.userId ??
        paymentIntent.metadata?.userId ??
        paymentIntent.metadata?.user_id ??
        null,
      userEmail:
        orderSnapshot.userEmail ??
        paymentIntent.metadata?.userEmail ??
        paymentIntent.metadata?.user_email ??
        paymentIntent.receipt_email ??
        null,
      userDisplayName: orderSnapshot.userDisplayName ?? null,
      // ✅ AJOUTER les infos de livraison depuis orderSnapshot
      address: orderSnapshot.address ?? null,
      contact: orderSnapshot.contact ?? null,
      stripe: {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          created: paymentIntent.created,
          latestChargeId: paymentIntent.latest_charge ?? null,
          nextAction: paymentIntent.next_action ?? null,
        },
      },
      updatedAt: FieldValue.serverTimestamp(),
      // Ajouter createdAt seulement si c'est une nouvelle commande
      ...(isNewOrder ? { createdAt: FieldValue.serverTimestamp() } : {}),
      ...(status === 'paid'
        ? {
            status: 'paid',
            paidAt: FieldValue.serverTimestamp(),
          }
        : status === 'failed'
        ? {
            status: 'payment_failed',
          }
        : {
            status: 'processing_payment',
          }),
    },
    { merge: true },
  );
};

export async function POST(request: NextRequest) {
  if (!stripeWebhookSecret) {
    console.error('Stripe webhook called without STRIPE_WEBHOOK_SECRET configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature Stripe manquante' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Signature Stripe invalide';
    console.error('Stripe webhook signature verification failed:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as PaymentIntentWithCharges;

      await upsertPaymentRecord(paymentIntent, {
        lastEvent: event.type,
        receivedAt: FieldValue.serverTimestamp(),
      });
      await createOrUpdateOrder(paymentIntent, 'paid');
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as PaymentIntentWithCharges;

      await upsertPaymentRecord(paymentIntent, {
        lastEvent: event.type,
        failureReason: paymentIntent.last_payment_error ?? null,
        receivedAt: FieldValue.serverTimestamp(),
      });
      await createOrUpdateOrder(paymentIntent, 'failed');
    } else if (
      event.type === 'payment_intent.processing' ||
      event.type === 'payment_intent.requires_action'
    ) {
      const paymentIntent = event.data.object as PaymentIntentWithCharges;
      await upsertPaymentRecord(paymentIntent, {
        lastEvent: event.type,
        receivedAt: FieldValue.serverTimestamp(),
      });
      await createOrUpdateOrder(paymentIntent, 'processing');
    } else {
      const objectId =
        typeof event.data?.object === 'object' &&
        event.data?.object !== null &&
        'id' in (event.data.object as unknown as Record<string, unknown>)
          ? ((event.data.object as { id?: string }).id ?? event.id)
          : event.id;

      await adminDb
        .collection('payments')
        .doc(objectId)
        .set(
          {
            lastUnhandledEvent: event.type,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
    }
  } catch (error) {
    console.error('Stripe webhook handling error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
