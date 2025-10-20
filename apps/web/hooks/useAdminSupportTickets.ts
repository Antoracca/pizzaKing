'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  SupportTicket,
  SupportTicketStatus,
  User,
} from '@pizza-king/shared';

export type AdminSupportTicket = SupportTicket & {
  customer: User | null;
};

type UseAdminSupportTicketsResult = {
  tickets: AdminSupportTicket[];
  loading: boolean;
  error: string | null;
};

const SUPPORT_TICKETS_COLLECTION = 'supportTickets';
const USERS_COLLECTION = 'users';

export function useAdminSupportTickets(
  status: SupportTicketStatus | 'all'
): UseAdminSupportTicketsResult {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    let cancelled = false;

    setLoading(true);
    setError(null);

    const baseRef = collection(db, SUPPORT_TICKETS_COLLECTION);
    const q =
      status === 'all'
        ? query(baseRef, orderBy('updatedAt', 'desc'))
        : query(
            baseRef,
            where('status', '==', status),
            orderBy('updatedAt', 'desc')
          );

    unsubscribe = onSnapshot(
      q,
      async snapshot => {
        try {
          const baseTickets = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<SupportTicket, 'id'>),
          }));

          const userIds = Array.from(
            new Set(baseTickets.map(ticket => ticket.userId).filter(Boolean))
          );

          const userEntries = await Promise.all(
            userIds.map(async userId => {
              const userRef = doc(db, USERS_COLLECTION, userId);
              const userSnap = await getDoc(userRef);
              if (!userSnap.exists()) return [userId, null] as const;
              return [userId, userSnap.data() as User] as const;
            })
          );

          if (cancelled) return;

          const userMap = new Map<string, User | null>(userEntries);

          setTickets(
            baseTickets.map(ticket => ({
              ...ticket,
              customer: userMap.get(ticket.userId) ?? null,
            }))
          );
          setLoading(false);
        } catch (err) {
          if (cancelled) return;
          setError(
            (err as Error)?.message ||
              "Impossible de récupérer les tickets support."
          );
          setLoading(false);
        }
      },
      err => {
        if (cancelled) return;
        setError(
          err?.message || "Impossible d'écouter les tickets support."
        );
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [status]);

  const orderedTickets = useMemo(
    () =>
      tickets.slice().sort((a, b) => {
        const aDate = a.updatedAt?.toDate?.() ?? a.createdAt.toDate();
        const bDate = b.updatedAt?.toDate?.() ?? b.createdAt.toDate();
        return bDate.getTime() - aDate.getTime();
      }),
    [tickets]
  );

  return {
    tickets: orderedTickets,
    loading,
    error,
  };
}
