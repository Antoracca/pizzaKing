'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SupportMessage, SupportTicket, User } from '@pizza-king/shared';

const SUPPORT_TICKETS_COLLECTION = 'supportTickets';
const SUPPORT_MESSAGES_SUBCOLLECTION = 'messages';

type UseSupportChatResult = {
  ticket: SupportTicket | null;
  messages: SupportMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
};

export function useSupportChat(authUser: User | null | undefined): UseSupportChatResult {
  const userId = useMemo(() => authUser?.id ?? null, [authUser?.id]);
  const userDisplayName = useMemo(() => {
    if (!authUser) return 'Client Pizza King';
    const baseName = `${authUser.firstName ?? ''} ${authUser.lastName ?? ''}`.trim();
    return authUser.displayName?.trim() || baseName || authUser.email || 'Client Pizza King';
  }, [authUser]);

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!userId) {
      setTicket(null);
      setTicketId(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchLatestTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const ticketsRef = collection(db, SUPPORT_TICKETS_COLLECTION);
        const existingQuery = query(
          ticketsRef,
          where('userId', '==', userId),
          where('status', '==', 'open'),
          limit(1)
        );
        const existingSnapshot = await getDocs(existingQuery);

        if (!isCancelled && !existingSnapshot.empty) {
          const docSnap = existingSnapshot.docs[0];
          const data = docSnap.data() as Omit<SupportTicket, 'id'>;
          setTicket({ id: docSnap.id, ...data });
          setTicketId(docSnap.id);
          setLoading(false);
        } else if (!isCancelled) {
          setTicket(null);
          setTicketId(null);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            (err as Error)?.message || 'Impossible de préparer la conversation support.'
          );
          setLoading(false);
        }
      }
    };

    void fetchLatestTicket();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, ticketId);
    const messagesRef = collection(
      db,
      SUPPORT_TICKETS_COLLECTION,
      ticketId,
      SUPPORT_MESSAGES_SUBCOLLECTION
    );
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribeTicket = onSnapshot(ticketRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Omit<SupportTicket, 'id'>;
        setTicket({ id: snapshot.id, ...data });
      }
    });

    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      snapshot => {
        const nextMessages = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<SupportMessage, 'id'>),
        }));
        setMessages(nextMessages);
        setLoading(false);
      },
      err => {
        setError(
          err?.message || 'Impossible de charger les messages du support.'
        );
        setLoading(false);
      }
    );

    return () => {
      unsubscribeTicket();
      unsubscribeMessages();
    };
  }, [ticketId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !userId || sending) return;

      setSending(true);
      setError(null);

      try {
        let activeTicketId = ticketId;
        const isNewTicket = !activeTicketId;

        if (!activeTicketId) {
          const now = Timestamp.now();
          const ticketData: Omit<SupportTicket, 'id'> = {
            userId,
            userDisplayName,
            status: 'open',
            channel: 'chat',
            createdAt: now,
            updatedAt: now,
            lastMessageAt: now,
            lastMessagePreview: trimmed.slice(0, 140),
            assignedAgentId: null,
            assignedAgentName: null,
            assignedAt: null,
            unreadCountForAgent: 1,
            unreadCountForUser: 0,
            lastMessageSender: 'user',
          };
          const ticketsRef = collection(db, SUPPORT_TICKETS_COLLECTION);
          const ticketDoc = await addDoc(ticketsRef, ticketData);
          activeTicketId = ticketDoc.id;
          setTicket({ id: ticketDoc.id, ...ticketData });
          setTicketId(ticketDoc.id);
        }

        const messagesRef = collection(
          db,
          SUPPORT_TICKETS_COLLECTION,
          activeTicketId,
          SUPPORT_MESSAGES_SUBCOLLECTION
        );
        await addDoc(messagesRef, {
          ticketId: activeTicketId,
          sender: 'user',
          senderId: userId,
          text: trimmed,
          createdAt: serverTimestamp(),
          read: false,
        });

        const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, activeTicketId);
        if (isNewTicket) {
          await updateDoc(ticketRef, {
            updatedAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
            lastMessagePreview: trimmed.slice(0, 140),
            status: 'open',
            lastMessageSender: 'user',
            unreadCountForAgent: 1,
            unreadCountForUser: 0,
          });
        } else {
          await updateDoc(ticketRef, {
            updatedAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
            lastMessagePreview: trimmed.slice(0, 140),
            status: 'open',
            lastMessageSender: 'user',
            unreadCountForAgent: increment(1),
            unreadCountForUser: 0,
          });
        }
      } catch (err) {
        setError(
          (err as Error)?.message || "Impossible d'envoyer le message au support."
        );
      } finally {
        setSending(false);
      }
    },
    [sending, ticketId, userId]
  );

  return {
    ticket,
    messages,
    loading,
    sending,
    error,
    sendMessage,
  };
}
