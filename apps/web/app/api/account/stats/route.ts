import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { Timestamp } from 'firebase-admin/firestore';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COUNTABLE_STATUSES = new Set([
  'paid',
  'processing_payment',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'completed',
]);

type OrderRecord = {
  status?: string;
  total?: number;
  amount?: number;
  pricing?: { total?: number };
  createdAt?: Timestamp | Date | string | null;
  paidAt?: Timestamp | Date | string | null;
  updatedAt?: Timestamp | Date | string | null;
};

function isFirestoreTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  );
}

function toDate(value: OrderRecord['createdAt']): Date | null {
  if (!value) {
    return null;
  }

  if (isFirestoreTimestamp(value)) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function resolveOrderTotal(order: OrderRecord): number {
  if (typeof order.total === 'number') {
    return order.total;
  }

  if (order.pricing && typeof order.pricing.total === 'number') {
    return order.pricing.total;
  }

  if (typeof order.amount === 'number') {
    return order.amount;
  }

  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader =
      request.headers.get('authorization') ?? request.headers.get('Authorization');

    if (!authHeader || !authHeader.trim().toLowerCase().startsWith('bearer ')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 },
      );
    }

    const idToken = authHeader.replace(/bearer\s+/i, '').trim();
    if (!idToken) {
      return NextResponse.json(
        { error: 'Jeton d’authentification manquant' },
        { status: 401 },
      );
    }

    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Invalid ID token for account stats:', error);
      return NextResponse.json(
        { error: 'Authentification invalide' },
        { status: 401 },
      );
    }

    const uid = decodedToken.uid;

    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('userId', '==', uid)
      .get();

    let totalOrders = 0;
    let totalSpent = 0;
    let lastOrderTimestamp: number | null = null;

    ordersSnapshot.forEach(doc => {
      const data = doc.data() as OrderRecord;
      const status = (data.status ?? 'pending').toLowerCase();

      if (!COUNTABLE_STATUSES.has(status)) {
        return;
      }

      totalOrders += 1;
      totalSpent += resolveOrderTotal(data);

      const relevantDate =
        toDate(data.paidAt) ??
        toDate(data.createdAt) ??
        toDate(data.updatedAt);

      if (relevantDate) {
        const timestamp = relevantDate.getTime();
        if (Number.isFinite(timestamp)) {
          if (lastOrderTimestamp === null || timestamp > lastOrderTimestamp) {
            lastOrderTimestamp = timestamp;
          }
        }
      }
    });

    const averageOrderValue =
      totalOrders > 0 ? totalSpent / totalOrders : 0;

    const lastOrderAtIso =
      typeof lastOrderTimestamp === 'number'
        ? new Date(lastOrderTimestamp).toISOString()
        : null;

    return NextResponse.json({
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastOrderAt: lastOrderAtIso,
    });
  } catch (error) {
    console.error('Failed to compute account stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 },
    );
  }
}
