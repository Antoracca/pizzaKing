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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SupportTicket, SupportTicketStatus } from '@pizza-king/shared/src/types/support';
import type { User } from '@pizza-king/shared/src/types/user';

const SUPPORT_TICKETS_COLLECTION = 'supportTickets';
const USERS_COLLECTION = 'users';

export type AdminSupportTicket = SupportTicket & {
  customer: User | null;
};

type UseAdminSupportTicketsResult = {
  tickets: AdminSupportTicket[];
  unassignedTickets: AdminSupportTicket[];
  myTickets: AdminSupportTicket[];
  loading: boolean;
  error: string | null;
};

export function useAdminSupportTickets(
  status: SupportTicketStatus | 'all',
  agentId?: string | null
): UseAdminSupportTicketsResult {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const baseRef = collection(db, SUPPORT_TICKETS_COLLECTION);

    // Query simple : juste orderBy sans where pour éviter les problèmes d'index
    const q = query(baseRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      async snapshot => {
        try {
          const ticketsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<SupportTicket, 'id'>),
          }));

          // Filtrer par statut en mémoire
          const filteredByStatus = status === 'all'
            ? ticketsData
            : ticketsData.filter(ticket => ticket.status === status);

          // Enrich with customer data
          const userIds = Array.from(
            new Set(filteredByStatus.map(ticket => ticket.userId))
          );

          const userEntries = await Promise.all(
            userIds.map(async userId => {
              try {
                const userRef = doc(db, USERS_COLLECTION, userId);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) return [userId, null] as const;
                const userData = userSnap.data() as User;
                return [userId, { ...userData, id: userSnap.id }] as const;
              } catch {
                return [userId, null] as const;
              }
            })
          );

          const userMap = new Map<string, User | null>(userEntries);

          const enriched: AdminSupportTicket[] = filteredByStatus.map(ticket => ({
            ...ticket,
            customer: userMap.get(ticket.userId) ?? null,
          }));

          setTickets(enriched);
          setLoading(false);
        } catch (err) {
          console.error('Failed to enrich support tickets', err);
          setError(err instanceof Error ? err.message : 'Erreur de chargement');
          setLoading(false);
        }
      },
      err => {
        console.error('Failed to fetch support tickets', err);
        setError(err?.message || 'Impossible de charger les tickets.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [status]);

  const unassignedTickets = useMemo(() => {
    return tickets.filter(
      ticket => !ticket.assignedAgentId && ticket.status !== 'resolved'
    );
  }, [tickets]);

  const myTickets = useMemo(() => {
    if (!agentId) return [];
    return tickets.filter(ticket => ticket.assignedAgentId === agentId);
  }, [tickets, agentId]);

  return {
    tickets,
    unassignedTickets,
    myTickets,
    loading,
    error,
  };
}
