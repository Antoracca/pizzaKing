'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  CheckCheck,
  Mail,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  User as UserIcon,
  Eye,
} from 'lucide-react';
import type { SupportTicketStatus } from '@pizza-king/shared/src/types/support';
import type { User } from '@pizza-king/shared/src/types/user';
import { useAdminSupportConversation } from '@/hooks/useAdminSupportConversation';
import { Timestamp } from 'firebase/firestore';
import { TypingIndicator } from './TypingIndicator';
import { formatMessageTime, formatFullDate } from '@/lib/support-utils';
import { SUPPORT_STATUS_LABELS, SUPPORT_STATUS_COLORS } from '@pizza-king/shared/src/constants/support';

interface Props {
  ticketId: string | null;
  agent: User | null | undefined;
  customer: User | null | undefined;
}

export default function AdminSupportConversation({
  ticketId,
  agent,
  customer,
}: Props) {
  const {
    ticket,
    messages,
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
  } = useAdminSupportConversation(ticketId, agent);

  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isAssignedToMe = ticket?.assignedAgentId === agent?.id;
  const isUnassigned = !ticket?.assignedAgentId;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (ticketId) {
      setInput('');
    }
  }, [ticketId]);

  const handleTyping = useCallback(async () => {
    if (!ticketId || !agent?.id) return;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      void setTyping(false);
    }, 1500);
    await setTyping(true);
  }, [agent?.id, setTyping, ticketId]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;
      setPending(true);
      try {
        await sendMessage(trimmed);
        setInput('');
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        await setTyping(false);
      } finally {
        setPending(false);
      }
    },
    [input, sendMessage, setTyping]
  );

  const handleSetStatus = useCallback(
    async (status: SupportTicketStatus) => {
      await updateStatus(status);
    },
    [updateStatus]
  );

  const handleMarkAsRead = useCallback(async () => {
    await markAsRead();
  }, [markAsRead]);

  const handleAssignToMe = useCallback(async () => {
    if (!agent?.id) return;
    const name = `${agent.firstName ?? ''} ${agent.lastName ?? ''}`.trim() || agent.email || 'Agent';
    await assignToAgent(agent.id, name);
  }, [agent, assignToAgent]);

  // Auto-mark as read when textarea is focused
  const handleTextareaFocus = useCallback(() => {
    if (unreadCount > 0) {
      void handleMarkAsRead();
    }
  }, [unreadCount, handleMarkAsRead]);

  if (!ticketId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-slate-400">
        <MessageSquare className="h-10 w-10 text-orange-300" />
        <p className="font-medium text-slate-600">
          Sélectionne une conversation dans la liste.
        </p>
      </div>
    );
  }

  const ticketDisplay = ticket?.ticketNumber || `#${ticket?.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {ticket?.userDisplayName || customer?.email || 'Client Pizza King'}
            </h2>
            <p className="text-sm text-slate-500">
              {ticketDisplay} · Mis à jour{' '}
              {formatFullDate(ticket?.updatedAt ?? ticket?.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket?.status ?? 'open'} />

            {unreadCount > 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                onClick={handleMarkAsRead}
              >
                <Eye className="h-4 w-4" />
                Marquer comme lu ({unreadCount})
              </Button>
            ) : null}

            {isUnassigned ? (
              <Button
                size="sm"
                variant="default"
                className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                onClick={handleAssignToMe}
              >
                <ShieldCheck className="h-4 w-4" />
                Prendre en charge
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    handleSetStatus(
                      ticket?.status === 'resolved' ? 'open' : 'resolved'
                    )
                  }
                >
                  <ShieldCheck className="h-4 w-4" />
                  {ticket?.status === 'resolved'
                    ? 'Rouvrir'
                    : 'Marquer comme résolu'}
                </Button>
                {ticket?.status !== 'resolved' ? (
                  ticket?.status === 'pending' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleSetStatus('in_progress')}
                    >
                      Reprendre
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => handleSetStatus('pending')}
                    >
                      Mettre en attente
                    </Button>
                  )
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Status banners */}
        {ticket?.status === 'pending' ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Conversation mise en attente pour suivi ultérieur.
          </div>
        ) : null}
        {ticket?.status === 'resolved' ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
            Résolue par {ticket.resolvedByAgentName ?? 'le support'} le{' '}
            {formatFullDate(ticket.resolvedAt)}.
          </div>
        ) : null}

        {/* Customer info */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoChip icon={Mail} label="Email" value={customer?.email ?? '—'} />
          <InfoChip
            icon={Phone}
            label="Téléphone"
            value={customer?.phoneNumber ?? '—'}
          />
          <InfoChip
            icon={UserIcon}
            label="Fidélité"
            value={`${customer?.loyaltyPoints ?? 0} pts`}
          />
          <InfoChip
            icon={ShieldCheck}
            label="Commandes"
            value={`${customer?.totalOrders ?? 0}`}
          />
        </div>
      </header>

      {/* Messages */}
      <section className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 py-4 sm:px-4">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isAgent={message.sender === 'agent'}
                />
              ))}

              {userTyping ? (
                <TypingIndicator name={userTypingName} variant="client" />
              ) : null}

              <div ref={endRef} />
            </>
          )}
        </div>

        {error ? (
          <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-100 bg-white px-3 py-4 sm:px-4"
        >
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              rows={3}
              value={input}
              onChange={event => {
                setInput(event.target.value);
                void handleTyping();
              }}
              onFocus={handleTextareaFocus}
              placeholder="Écris une réponse au client…"
              disabled={!isAssignedToMe && !isUnassigned}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200/60 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-2xl bg-orange-500 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={pending || !input.trim() || (!isAssignedToMe && !isUnassigned)}
              aria-label="Envoyer le message"
            >
              {pending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              {isUnassigned
                ? 'Conversation non assignée'
                : isAssignedToMe
                ? `Conversation assignée à vous`
                : `Assignée à ${ticket?.assignedAgentName ?? 'un autre agent'}`}
            </span>
            {ticket?.unreadCountForUser ? (
              <span className="text-orange-600">
                {ticket.unreadCountForUser} message(s) non lu(s) côté client
              </span>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  return (
    <Badge className={SUPPORT_STATUS_COLORS[status]}>
      {SUPPORT_STATUS_LABELS[status]}
    </Badge>
  );
}

function LoadingState() {
  return (
    <div className="flex h-40 items-center justify-center gap-2 text-slate-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      Chargement de la conversation…
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'agent' | 'system';
    createdAt: Timestamp;
    read?: boolean;
    readAt?: Timestamp | null;
    isAutoReply?: boolean;
  };
  isAgent: boolean;
}

function MessageBubble({ message, isAgent }: MessageBubbleProps) {
  if (message.sender === 'system' || message.isAutoReply) {
    return (
      <div className="my-4 flex justify-center">
        <div className="max-w-[85%] rounded-xl bg-slate-100 px-4 py-2 text-center text-xs text-slate-600">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-3 flex ${
        isAgent ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isAgent
            ? 'bg-orange-500 text-white'
            : message.read
            ? 'bg-white text-slate-800 border border-slate-200'
            : 'bg-blue-50 text-slate-900 border-2 border-blue-300'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.text}
        </p>
        <div
          className={`mt-2 flex items-center justify-between gap-3 text-xs ${
            isAgent ? 'text-orange-100/90' : 'text-slate-400'
          }`}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {isAgent ? (
            message.read ? (
              <span className="flex items-center gap-1 text-blue-300">
                <CheckCheck className="h-3.5 w-3.5" />
                Vu
              </span>
            ) : (
              <span className="flex items-center gap-1 opacity-70">
                <Check className="h-3.5 w-3.5" />
                Envoyé
              </span>
            )
          ) : !message.read ? (
            <Badge className="h-5 bg-red-500 text-[10px] text-white">
              Non lu
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <Icon className="h-4 w-4 text-orange-500" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}
