'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  SupportEvent,
  SupportMessage,
  SupportPresence,
  SupportTicket,
  SupportTicketStatus,
} from '@pizza-king/shared/src/types/support';
import type { User } from '@pizza-king/shared/src/types/user';
import { formatUserName } from '@/lib/support-utils';

const SUPPORT_TICKETS_COLLECTION = 'supportTickets';
const SUPPORT_MESSAGES_SUBCOLLECTION = 'messages';
const SUPPORT_PRESENCE_SUBCOLLECTION = 'presence';
const SUPPORT_EVENTS_SUBCOLLECTION = 'events';

type ConversationResult = {
  ticket: SupportTicket | null;
  messages: SupportMessage[];
  events: SupportEvent[];
  loading: boolean;
  error: string | null;
  userTyping: boolean;
  userTypingName: string | null;
  unreadCount: number;
  sendMessage: (text: string) => Promise<void>;
  setTyping: (typing: boolean) => Promise<void>;
  updateStatus: (status: SupportTicketStatus) => Promise<void>;
  markAsRead: () => Promise<void>;
  assignToAgent: (agentId: string, agentName: string) => Promise<void>;
};

export function useAdminSupportConversation(
  ticketId: string | null,
  agent: User | null | undefined
): ConversationResult {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [events, setEvents] = useState<SupportEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userTyping, setUserTyping] = useState(false);
  const [userTypingName, setUserTypingName] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const agentName = useMemo(() => formatUserName(agent), [agent]);

  const appendSystemMessage = useCallback(
    async (currentTicketId: string, text: string) => {
      const messagesRef = collection(
        db,
        SUPPORT_TICKETS_COLLECTION,
        currentTicketId,
        SUPPORT_MESSAGES_SUBCOLLECTION
      );
      await addDoc(messagesRef, {
        ticketId: currentTicketId,
        sender: 'system' as const,
        text,
        createdAt: serverTimestamp(),
        status: 'delivered' as const,
      });
    },
    []
  );

  const resetState = useCallback(() => {
    setTicket(null);
    setMessages([]);
    setEvents([]);
    setUserTyping(false);
    setUserTypingName(null);
    setUnreadCount(0);
    setLoading(false);
    setError(null);
  }, []);

  // Listen to ticket
  useEffect(() => {
    if (!ticketId) {
      resetState();
      return;
    }

    setLoading(true);
    setError(null);

    const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, ticketId);

    const unsubscribe = onSnapshot(
      ticketRef,
      snapshot => {
        if (!snapshot.exists()) {
          setTicket(null);
          setLoading(false);
          return;
        }
        const data = snapshot.data() as Omit<SupportTicket, 'id'>;
        setTicket({ ...data, id: snapshot.id });
        setLoading(false);
      },
      err => {
        setError(
          err?.message || 'Impossible de charger le ticket sélectionné.'
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [resetState, ticketId]);

  // Listen to messages (NO AUTO-MARK AS READ)
  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      setUnreadCount(0);
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
        const msgs = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<SupportMessage, 'id'>),
        }));
        setMessages(msgs);

        // Count unread user messages (but DON'T mark as read)
        const unread = msgs.filter(m => m.sender === 'user' && !m.read).length;
        setUnreadCount(unread);
      },
      err => {
        setError(
          err?.message || 'Impossible de récupérer les messages du ticket.'
        );
      }
    );

    return () => unsubscribe();
  }, [ticketId]);

  // Listen to events
  useEffect(() => {
    if (!ticketId) {
      setEvents([]);
      return;
    }

    const eventsRef = collection(
      db,
      SUPPORT_TICKETS_COLLECTION,
      ticketId,
      SUPPORT_EVENTS_SUBCOLLECTION
    );
    const q = query(eventsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      setEvents(
        snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<SupportEvent, 'id'>),
        }))
      );
    });

    return () => unsubscribe();
  }, [ticketId]);

  // Listen to user presence
  useEffect(() => {
    if (!ticketId) {
      setUserTyping(false);
      setUserTypingName(null);
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
        if (docSnap.id.startsWith('user_')) {
          const data = docSnap.data() as SupportPresence & {
            displayName?: string;
          };
          setUserTyping(Boolean(data.typing));
          setUserTypingName(data.displayName ?? null);
        }
      });
    });

    return () => unsubscribe();
  }, [ticketId]);

  // Update agent presence
  useEffect(() => {
    if (!ticketId || !agent?.id) return;

    const presenceDoc = doc(
      db,
      SUPPORT_TICKETS_COLLECTION,
      ticketId,
      SUPPORT_PRESENCE_SUBCOLLECTION,
      `agent_${agent.id}`
    );

    const payload: Partial<SupportPresence> & { displayName: string } = {
      typing: false,
      lastSeenAt: serverTimestamp() as Timestamp,
      online: true,
      device: 'admin',
      displayName: agentName,
    };

    void setDoc(presenceDoc, payload, { merge: true });

    return () => {
      void setDoc(
        presenceDoc,
        {
          typing: false,
          online: false,
          lastSeenAt: serverTimestamp(),
          device: 'admin',
          displayName: agentName,
        },
        { merge: true }
      );
    };
  }, [agent?.id, agentName, ticketId]);

  // Set typing indicator
  const setTyping = useCallback(
    async (typing: boolean) => {
      if (!ticketId || !agent?.id) return;
      const presenceDoc = doc(
        db,
        SUPPORT_TICKETS_COLLECTION,
        ticketId,
        SUPPORT_PRESENCE_SUBCOLLECTION,
        `agent_${agent.id}`
      );
      await setDoc(
        presenceDoc,
        {
          typing,
          lastSeenAt: serverTimestamp(),
          online: true,
          device: 'admin' as const,
          displayName: agentName,
        },
        { merge: true }
      );
    },
    [agent?.id, agentName, ticketId]
  );

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !ticketId || !agent?.id) return;

      const messagesRef = collection(
        db,
        SUPPORT_TICKETS_COLLECTION,
        ticketId,
        SUPPORT_MESSAGES_SUBCOLLECTION
      );
      const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, ticketId);

      await addDoc(messagesRef, {
        ticketId,
        sender: 'agent' as const,
        senderId: agent.id,
        text: trimmed,
        createdAt: serverTimestamp(),
        read: false,
        status: 'sent' as const,
      });

      await updateDoc(ticketRef, {
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessagePreview: trimmed.slice(0, 140),
        lastMessageSender: 'agent' as const,
        unreadCountForUser: (ticket?.unreadCountForUser ?? 0) + 1,
        status:
          ticket?.status === 'resolved' ? 'open' : ticket?.status ?? 'in_progress',
        resolvedAt: ticket?.status === 'resolved' ? null : ticket?.resolvedAt ?? null,
        resolvedByAgentId:
          ticket?.status === 'resolved' ? null : ticket?.resolvedByAgentId ?? null,
        resolvedByAgentName:
          ticket?.status === 'resolved' ? null : ticket?.resolvedByAgentName ?? null,
      });
    },
    [agent?.id, ticket, ticketId]
  );

  // Mark messages as read (MANUAL)
  const markAsRead = useCallback(async () => {
    if (!ticketId) return;

    const messagesRef = collection(
      db,
      SUPPORT_TICKETS_COLLECTION,
      ticketId,
      SUPPORT_MESSAGES_SUBCOLLECTION
    );
    const q = query(
      messagesRef,
      where('sender', '==', 'user'),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, ticketId);

    snapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, {
        read: true,
        readAt: serverTimestamp(),
      });
    });

    batch.update(ticketRef, {
      unreadCountForAgent: 0,
    });

    await batch.commit();
  }, [ticketId]);

  // Update ticket status
  const updateStatus = useCallback(
    async (status: SupportTicketStatus) => {
      if (!ticketId || !agent?.id) return;
      const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, ticketId);
      const updates: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === 'resolved') {
        updates.resolvedAt = serverTimestamp();
        updates.resolvedByAgentId = agent.id;
        updates.resolvedByAgentName = agentName;
        await appendSystemMessage(
          ticketId,
          `${agentName} a mis fin à ce ticket. Statut : résolu. Merci pour votre fidélité !`
        );
        await addDoc(
          collection(
            db,
            SUPPORT_TICKETS_COLLECTION,
            ticketId,
            SUPPORT_EVENTS_SUBCOLLECTION
          ),
          {
            type: 'ticket_resolved' as const,
            createdAt: serverTimestamp(),
            actorId: agent.id,
            actorName: agentName,
          }
        );
      }

      if (status === 'pending') {
        await appendSystemMessage(
          ticketId,
          `${agentName} a mis la conversation en attente`
        );
        await addDoc(
          collection(
            db,
            SUPPORT_TICKETS_COLLECTION,
            ticketId,
            SUPPORT_EVENTS_SUBCOLLECTION
          ),
          {
            type: 'ticket_pending' as const,
            createdAt: serverTimestamp(),
            actorId: agent.id,
            actorName: agentName,
          }
        );
      }

      if (status === 'in_progress' && ticket?.status === 'pending') {
        await appendSystemMessage(
          ticketId,
          `${agentName} a repris la conversation`
        );
        await addDoc(
          collection(
            db,
            SUPPORT_TICKETS_COLLECTION,
            ticketId,
            SUPPORT_EVENTS_SUBCOLLECTION
          ),
          {
            type: 'ticket_reopened' as const,
            createdAt: serverTimestamp(),
            actorId: agent.id,
            actorName: agentName,
          }
        );
      }

      await updateDoc(ticketRef, updates);
    },
    [agent?.id, agentName, appendSystemMessage, ticket?.status, ticketId]
  );

  // Assign ticket to agent (MANUAL)
  const assignToAgent = useCallback(
    async (agentId: string, assignedAgentName: string) => {
      if (!ticketId) return;

      const ticketRef = doc(db, SUPPORT_TICKETS_COLLECTION, ticketId);
      const messagesRef = collection(
        db,
        SUPPORT_TICKETS_COLLECTION,
        ticketId,
        SUPPORT_MESSAGES_SUBCOLLECTION
      );

      await updateDoc(ticketRef, {
        assignedAgentId: agentId,
        assignedAgentName,
        assignedAt: serverTimestamp(),
        status: 'in_progress' as const,
      });

      await addDoc(messagesRef, {
        ticketId,
        sender: 'system' as const,
        text: `${assignedAgentName} a rejoint la conversation`,
        createdAt: serverTimestamp(),
        status: 'delivered' as const,
      });

      await addDoc(
        collection(
          db,
          SUPPORT_TICKETS_COLLECTION,
          ticketId,
          SUPPORT_EVENTS_SUBCOLLECTION
        ),
        {
          type: 'agent_joined' as const,
          createdAt: serverTimestamp(),
          actorId: agentId,
          actorName: assignedAgentName,
        }
      );
    },
    [ticketId]
  );

  return {
    ticket,
    messages,
    events,
    loading,
    error,
    userTyping,
    userTypingName,
    unreadCount,
    sendMessage,
    setTyping,
    updateStatus,
    markAsRead,
    assignToAgent,
  };
}
