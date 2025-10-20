'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  setDoc,
  updateDoc,
  where,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  SupportMessage,
  SupportPresence,
  SupportTicket,
} from '@pizza-king/shared/src/types/support';
import type { User } from '@pizza-king/shared/src/types/user';
import { AUTO_REPLY_FIRST_MESSAGE, TYPING_INDICATOR_TIMEOUT } from '@pizza-king/shared/src/constants/support';
import { generateTicketNumber, formatUserName } from '@/lib/support-utils';

const SUPPORT_TICKETS_COLLECTION = 'supportTickets';
const SUPPORT_MESSAGES_SUBCOLLECTION = 'messages';
const SUPPORT_PRESENCE_SUBCOLLECTION = 'presence';
const OUTBOX_STORAGE_KEY = 'pk_support_outbox';

type OutboxEntry = {
  id: string;
  userId: string;
  ticketId: string | null;
  text: string;
  createdAt: number;
};

type UseSupportChatResult = {
  ticket: SupportTicket | null;
  messages: SupportMessage[];
  pendingMessages: SupportMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  setTyping: (typing: boolean) => Promise<void>;
  agentTyping: boolean;
  agentTypingName: string | null;
  agentOnline: boolean;
  agentLastSeen: Timestamp | null;
};

// Helpers
const isOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine;

const generateLocalId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const buildLocalMessage = (
  entry: OutboxEntry,
  userId: string
): SupportMessage => ({
  id: entry.id,
  ticketId: entry.ticketId ?? '',
  sender: 'user',
  senderId: userId,
  text: entry.text,
  createdAt: Timestamp.fromMillis(entry.createdAt),
  status: 'pending',
  read: false,
  clientMessageId: entry.id,
});

// Outbox management
class OutboxManager {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  getAll(userId: string): OutboxEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const all: OutboxEntry[] = JSON.parse(raw);
      return all.filter(e => e.userId === userId);
    } catch {
      return [];
    }
  }

  add(entry: OutboxEntry): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getAll(entry.userId);
      existing.push(entry);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to add to outbox', err);
    }
  }

  remove(id: string, userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const all = this.getAll(userId);
      const filtered = all.filter(e => e.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to remove from outbox', err);
    }
  }

  clear(userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const all: OutboxEntry[] = JSON.parse(raw);
      const others = all.filter(e => e.userId !== userId);
      localStorage.setItem(this.storageKey, JSON.stringify(others));
    } catch (err) {
      console.error('Failed to clear outbox', err);
    }
  }
}

const outbox = new OutboxManager(OUTBOX_STORAGE_KEY);

export function useSupportChat(authUser: User | null | undefined): UseSupportChatResult {
  const userId = useMemo(() => authUser?.id ?? null, [authUser?.id]);
  const userDisplayName = useMemo(() => formatUserName(authUser), [authUser]);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const ticketIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<SupportMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agentTyping, setAgentTyping] = useState(false);
  const [agentTypingName, setAgentTypingName] = useState<string | null>(null);
  const [agentOnline, setAgentOnline] = useState(false);
  const [agentLastSeen, setAgentLastSeen] = useState<Timestamp | null>(null);

  // Sync pending messages from outbox
  const syncPendingMessages = useCallback(() => {
    if (!userId) {
      setPendingMessages([]);
      return;
    }
    const entries = outbox.getAll(userId);
    const locals = entries.map(e => buildLocalMessage(e, userId));
    setPendingMessages(locals);
  }, [userId]);

  useEffect(() => {
    syncPendingMessages();
  }, [syncPendingMessages]);

  // Remove local pending messages once we see the server-confirmed version
  useEffect(() => {
    if (messages.length === 0) return;
    setPendingMessages(prev =>
      prev.filter(localMessage => {
        const clientId = localMessage.clientMessageId ?? localMessage.id;
        return !messages.some(serverMessage => serverMessage.clientMessageId === clientId);
      })
    );
  }, [messages]);

  // Find or create ticket
  const applyTicketSnapshot = useCallback((data: Omit<SupportTicket, 'id'>, docId: string) => {
    setTicket({ ...data, id: docId });
    setTicketId(docId);
    ticketIdRef.current = docId;
  }, []);

  useEffect(() => {
    if (!userId) {
      setTicket(null);
      setTicketId(null);
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const ticketsRef = collection(db, SUPPORT_TICKETS_COLLECTION);
    const q = query(
      ticketsRef,
      where('userId', '==', userId),
      where('status', 'in', ['open', 'in_progress', 'pending']),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        if (snapshot.empty) {
          setTicket(null);
          setTicketId(null);
          ticketIdRef.current = null;
          setLoading(false);
        } else {
          const doc = snapshot.docs[0];
          const data = doc.data() as Omit<SupportTicket, 'id'>;
          applyTicketSnapshot(data, doc.id);
          setLoading(false);
        }
      },
      err => {
        console.error('Failed to fetch ticket', err);
        setError('Impossible de charger le ticket.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, applyTicketSnapshot]);

  // Listen to messages
  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(
      db,
      SUPPORT_TICKETS_COLLECTION,
      ticketId,
      SUPPORT_MESSAGES_SUBCOLLECTION
    );
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<SupportMessage, 'id'>),
        }));
        setMessages(msgs);

        // Mark agent messages as read
        const unreadAgentMessages = snapshot.docs.filter(doc => {
          const data = doc.data() as SupportMessage;
          return data.sender === 'agent' && !data.read;
        });

        if (unreadAgentMessages.length > 0) {
          void (async () => {
            const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, ticketId);
            for (const msgDoc of unreadAgentMessages) {
              await updateDoc(msgDoc.ref, {
                read: true,
                readAt: serverTimestamp(),
              });
            }
            await updateDoc(ticketRef, {
              unreadCountForUser: 0,
            });
          })();
        }
      },
      err => {
        console.error('Failed to fetch messages', err);
        setError('Impossible de charger les messages.');
      }
    );

    return () => unsubscribe();
  }, [ticketId]);

  // Listen to agent presence
  useEffect(() => {
    if (!ticketId) {
      setAgentTyping(false);
      setAgentTypingName(null);
      setAgentOnline(false);
      setAgentLastSeen(null);
      return;
    }

    const presenceRef = collection(
      db,
      SUPPORT_TICKETS_COLLECTION,
      ticketId,
      SUPPORT_PRESENCE_SUBCOLLECTION
    );

    const unsubscribe = onSnapshot(presenceRef, snapshot => {
      snapshot.forEach(docSnap => {
        if (docSnap.id.startsWith('agent_')) {
          const data = docSnap.data() as SupportPresence & { displayName?: string };
          setAgentTyping(Boolean(data.typing));
          setAgentTypingName(data.displayName ?? null);
          setAgentOnline(Boolean(data.online));
          setAgentLastSeen(data.lastSeenAt ?? null);
        }
      });
    });

    return () => unsubscribe();
  }, [ticketId]);

  // Ensure user presence
  const ensurePresence = useCallback(async () => {
    if (!ticketIdRef.current || !userId) return;
    const presenceDoc = doc(
      db,
      SUPPORT_TICKETS_COLLECTION,
      ticketIdRef.current,
      SUPPORT_PRESENCE_SUBCOLLECTION,
      `user_${userId}`
    );
    await setDoc(
      presenceDoc,
      {
        typing: false,
        online: true,
        lastSeenAt: serverTimestamp(),
        device: 'web',
        displayName: userDisplayName,
      },
      { merge: true }
    );
  }, [userId, userDisplayName]);

  useEffect(() => {
    if (ticketId) {
      void ensurePresence();
    }
  }, [ticketId, ensurePresence]);

  // Set typing indicator
  const setTyping = useCallback(
    async (typing: boolean) => {
      if (!ticketIdRef.current || !userId) return;
      const presenceDoc = doc(
        db,
        SUPPORT_TICKETS_COLLECTION,
        ticketIdRef.current,
        SUPPORT_PRESENCE_SUBCOLLECTION,
        `user_${userId}`
      );
      await setDoc(
        presenceDoc,
        {
          typing,
          online: true,
          lastSeenAt: serverTimestamp(),
          device: 'web',
          displayName: userDisplayName,
        },
        { merge: true }
      );
    },
    [userId, userDisplayName]
  );

  // Flush outbox
  const flushOutbox = useCallback(async () => {
    if (!userId) return;
    const entries = outbox.getAll(userId);
    if (entries.length === 0) return;

    for (const entry of entries) {
      try {
        let currentTicketId = ticketIdRef.current;

        // Create ticket if needed
        let newTicketNumber: string | null = null;
        if (!currentTicketId) {
          newTicketNumber = generateTicketNumber();
          const ticketsRef = collection(db, SUPPORT_TICKETS_COLLECTION);
          const newTicketRef = await addDoc(ticketsRef, {
            userId,
            userDisplayName,
            status: 'open',
            channel: 'chat',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ticketNumber: newTicketNumber,
            unreadCountForAgent: 0,
            unreadCountForUser: 0,
            autoReplySent: false,
          });
          currentTicketId = newTicketRef.id;
        }

        const messagesRef = collection(
          db,
          SUPPORT_TICKETS_COLLECTION,
          currentTicketId,
          SUPPORT_MESSAGES_SUBCOLLECTION
        );
        const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, currentTicketId);

        // Send user message
        await addDoc(messagesRef, {
          ticketId: currentTicketId,
          sender: 'user',
          senderId: userId,
          text: entry.text,
          createdAt: serverTimestamp(),
          read: false,
          status: 'sent',
          clientMessageId: entry.id,
        });

        // Send auto-reply if first message (avec le numéro de ticket)
        const currentTicket = ticket?.id === currentTicketId ? ticket : null;
        if (!currentTicket || !currentTicket.autoReplySent) {
          const displayTicket = newTicketNumber || currentTicket?.ticketNumber || `#${currentTicketId.slice(0, 8).toUpperCase()}`;
          await addDoc(messagesRef, {
            ticketId: currentTicketId,
            sender: 'system',
            text: `Merci pour votre message ! Votre ticket ${displayTicket} a été créé. Un agent vous répondra dans les plus brefs délais.`,
            createdAt: serverTimestamp(),
            isAutoReply: true,
            status: 'delivered',
          });
        }

        // Update ticket
        await updateDoc(ticketRef, {
          updatedAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          lastMessagePreview: entry.text.slice(0, 140),
          lastMessageSender: 'user' as const,
          unreadCountForAgent: increment(1),
          unreadCountForUser: 0,
          autoReplySent: true,
          status: 'open',
        });

        outbox.remove(entry.id, userId);
      } catch (err) {
        console.error('Failed to flush outbox entry', err);
      }
    }

    syncPendingMessages();
  }, [userId, userDisplayName, ticket, syncPendingMessages]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !userId) return;

      const baseEntry: OutboxEntry = {
        id: generateLocalId(),
        userId,
        ticketId: ticketIdRef.current,
        text: trimmed,
        createdAt: Date.now(),
      };

      setSending(true);
      setError(null);

      const online = isOnline();
      let localPending: SupportMessage | null = null;
      let sentSuccessfully = false;

      if (online) {
        localPending = buildLocalMessage(baseEntry, userId);
        setPendingMessages(prev => [...prev, localPending]);
      }

      try {
        if (!online) {
          outbox.add(baseEntry);
          setPendingMessages(prev => [...prev, buildLocalMessage(baseEntry, userId)]);
          setSending(false);
          return;
        }

        let currentTicketId = ticketIdRef.current;

        // Create ticket if needed
        let newTicketNumber: string | null = null;
        if (!currentTicketId) {
          newTicketNumber = generateTicketNumber();
          const ticketsRef = collection(db, SUPPORT_TICKETS_COLLECTION);
          const newTicketRef = await addDoc(ticketsRef, {
            userId,
            userDisplayName,
            status: 'open',
            channel: 'chat',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ticketNumber: newTicketNumber,
            unreadCountForAgent: 0,
            unreadCountForUser: 0,
            autoReplySent: false,
          });
          currentTicketId = newTicketRef.id;
          ticketIdRef.current = currentTicketId;
          setTicketId(currentTicketId);
        }

        const messagesRef = collection(
          db,
          SUPPORT_TICKETS_COLLECTION,
          currentTicketId,
          SUPPORT_MESSAGES_SUBCOLLECTION
        );
        const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, currentTicketId);

        // Send user message
        await addDoc(messagesRef, {
          ticketId: currentTicketId,
          sender: 'user',
          senderId: userId,
          text: trimmed,
          createdAt: serverTimestamp(),
          read: false,
          status: 'sent',
          clientMessageId: baseEntry.id,
        });

        // Send auto-reply if first message (avec le numéro de ticket)
        const currentTicket = ticket?.id === currentTicketId ? ticket : null;
        if (!currentTicket || !currentTicket.autoReplySent) {
          const displayTicket = newTicketNumber || currentTicket?.ticketNumber || `#${currentTicketId.slice(0, 8).toUpperCase()}`;
          await addDoc(messagesRef, {
            ticketId: currentTicketId,
            sender: 'system',
            text: `Merci pour votre message ! Votre ticket ${displayTicket} a été créé. Un agent vous répondra dans les plus brefs délais.`,
            createdAt: serverTimestamp(),
            isAutoReply: true,
            status: 'delivered',
          });
        }

        // Update ticket
        await updateDoc(ticketRef, {
          updatedAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          lastMessagePreview: trimmed.slice(0, 140),
          lastMessageSender: 'user' as const,
          unreadCountForAgent: increment(1),
          unreadCountForUser: 0,
          autoReplySent: true,
          status: ticket?.status === 'resolved' ? 'open' : ticket?.status ?? 'open',
        });

        sentSuccessfully = true;
        try {
          await ensurePresence();
        } catch (presenceError) {
          console.error('Failed to update presence', presenceError);
        }
      } catch (err) {
        console.error('Failed to send message', err);
        setError('Impossible d\'envoyer le message. Réessaye.');
        outbox.add(baseEntry);
        setPendingMessages(prev => [
          ...prev.filter(msg => msg.id !== baseEntry.id),
          buildLocalMessage(baseEntry, userId),
        ]);
      } finally {
        if (localPending && sentSuccessfully) {
          setPendingMessages(prev => prev.filter(msg => msg.id !== localPending?.id));
        }
        setSending(false);
      }
    },
    [userId, userDisplayName, ticket, ensurePresence]
  );

  // Auto-flush on online
  useEffect(() => {
    const handleOnline = () => {
      void flushOutbox();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
      }
    };
  }, [flushOutbox]);

  // Flush on mount if online
  useEffect(() => {
    if (userId && isOnline()) {
      void flushOutbox();
    }
  }, [userId, flushOutbox]);

  return {
    ticket,
    messages,
    pendingMessages,
    loading,
    sending,
    error,
    sendMessage,
    setTyping,
    agentTyping,
    agentTypingName,
    agentOnline,
    agentLastSeen,
  };
}
