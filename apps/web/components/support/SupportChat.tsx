'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CheckCheck, History, PhoneOff, Pizza, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import { useSupportChat } from '@/hooks/useSupportChat';
import { Timestamp } from 'firebase/firestore';
import { TypingIndicator } from './TypingIndicator';
import { formatMessageTime, formatDateSeparator, formatRelativeTime, isDifferentDay } from '@/lib/support-utils';
import type { SupportMessage, SupportTicket, SupportTicketStatus } from '@pizza-king/shared/src/types/support';
import { SUPPORT_STATUS_LABELS, SUPPORT_STATUS_COLORS } from '@pizza-king/shared/src/constants/support';

export default function SupportChat() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    ticket,
    messages,
    pendingMessages,
    loading,
    historyTickets,
    historyLoading,
    historyError,
    sending,
    error,
    sendMessage,
    setTyping,
    agentTyping,
    agentTypingName,
  } = useSupportChat(user);

  const [input, setInput] = useState('');
  const [viewportMetrics, setViewportMetrics] = useState({
    top: 0,
    bottom: 0,
    height: 0,
  });
  const [layoutHeights, setLayoutHeights] = useState({
    header: 56,
    status: 0,
    input: 96,
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const historyButtonRef = useRef<HTMLButtonElement | null>(null);
  const historyMenuRef = useRef<HTMLDivElement | null>(null);

  const timeline = useMemo(() => {
    const merged = [...messages, ...pendingMessages];
    const sorted = merged.sort((a, b) => {
      const aTime =
        a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : Date.now();
      const bTime =
        b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : Date.now();

      if (aTime === bTime) {
        if (a.isAutoReply && !b.isAutoReply) return 1;
        if (!a.isAutoReply && b.isAutoReply) return -1;
        if (a.sender === 'system' && b.sender !== 'system') return 1;
        if (a.sender !== 'system' && b.sender === 'system') return -1;
        return a.id.localeCompare(b.id);
      }

      return aTime - bTime;
    });

    const firstUserIndex = sorted.findIndex(message => message.sender === 'user');
    const autoReplyIndex = sorted.findIndex(message => message.isAutoReply);

    if (
      autoReplyIndex > -1 &&
      firstUserIndex > -1 &&
      autoReplyIndex <= firstUserIndex
    ) {
      const [autoReply] = sorted.splice(autoReplyIndex, 1);
      sorted.splice(firstUserIndex + 1, 0, autoReply);
    }

    return sorted;
  }, [messages, pendingMessages]);

  const activeTicketId = ticket?.id ?? null;
  const historyGroups = useMemo(() => {
    const initial: Record<SupportTicketStatus, SupportTicket[]> = {
      open: [],
      in_progress: [],
      pending: [],
      resolved: [],
    };

    historyTickets.forEach(entry => {
      if (entry.id === activeTicketId) return;
      const status = entry.status ?? 'open';
      initial[status as SupportTicketStatus] = [
        ...initial[status as SupportTicketStatus],
        entry,
      ];
    });

    return initial;
  }, [historyTickets, activeTicketId]);
  const historyOrder: SupportTicketStatus[] = ['in_progress', 'pending', 'resolved', 'open'];

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: Array<{
      date: string;
      messages: typeof timeline;
    }> = [];

    timeline.forEach((message, index) => {
      // Gérer les messages pending sans createdAt
      const messageDate =
        message.createdAt instanceof Timestamp
          ? message.createdAt.toDate()
          : new Date();

      const prevMessageDate =
        index > 0 && timeline[index - 1].createdAt
          ? timeline[index - 1].createdAt instanceof Timestamp
            ? timeline[index - 1].createdAt.toDate()
            : new Date()
          : null;

      if (index === 0 || isDifferentDay(messageDate, prevMessageDate)) {
        groups.push({
          date: formatDateSeparator(messageDate),
          messages: [message],
        });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [timeline]);

  // Lock background scroll while the chat is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!historyOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyMenuRef.current?.contains(event.target as Node) ||
        historyButtonRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setHistoryOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [historyOpen]);

  // Track visual viewport to keep header/footer pinned around the keyboard on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const viewport = window.visualViewport;

    if (!viewport) {
      setViewportMetrics({
        top: 0,
        bottom: 0,
        height: window.innerHeight,
      });
      return;
    }

    const handleViewportChange = () => {
      const topOffset = viewport.offsetTop ?? 0;
      const bottomOffset = Math.max(
        0,
        window.innerHeight - viewport.height - (viewport.offsetTop ?? 0)
      );

      setViewportMetrics({
        top: Number.isFinite(topOffset) ? topOffset : 0,
        bottom: Number.isFinite(bottomOffset) ? bottomOffset : 0,
        height: Number.isFinite(viewport.height) ? viewport.height : window.innerHeight,
      });
    };

    handleViewportChange();
    viewport.addEventListener('resize', handleViewportChange, { passive: true });
    viewport.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });

    return () => {
      viewport.removeEventListener('resize', handleViewportChange);
      viewport.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  const isResolved = ticket?.status === 'resolved';
  const isPending = ticket?.status === 'pending';

  // Mesure des hauteurs pour éviter les chevauchements quand on passe en mode clavier
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measure = () => {
      setLayoutHeights({
        header: headerRef.current?.offsetHeight ?? 0,
        status: statusRef.current?.offsetHeight ?? 0,
        input: inputRef.current?.offsetHeight ?? 0,
      });
    };

    measure();
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [isPending, isResolved, error]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [timeline]);

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    void setTyping(false);
    void sendMessage(trimmed);
  }, [input, sendMessage, setTyping]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSend();
    },
    [handleSend]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
      if (!ticket?.id) return;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        void setTyping(false);
      }, 1500);
      void setTyping(true);
    },
    [setTyping, ticket?.id]
  );
  const handleCallUnavailable = useCallback(() => {
    if (typeof window === 'undefined') return;
    const event = new CustomEvent('pk-toast', {
      detail: {
        variant: 'warning',
        title: 'Appels indisponibles',
        description: "Les appels vocaux ne sont pas encore disponibles dans votre région. Utilisez le chat pour nous contacter.",
      },
    });
    window.dispatchEvent(event);
  }, []);

  const ticketDisplay = useMemo(() => {
    if (!ticket) return null;
    return ticket.ticketNumber || `#${ticket.id.slice(0, 8).toUpperCase()}`;
  }, [ticket]);

  const availableHeight = viewportMetrics.height
    ? `${viewportMetrics.height}px`
    : '100vh';
  const headerOffset = viewportMetrics.top > 0 ? viewportMetrics.top : 0;
  const keyboardOffset = viewportMetrics.bottom > 0 ? viewportMetrics.bottom : 0;
  const statusHeight = isPending || isResolved ? layoutHeights.status : 0;
  const contentPaddingTop = layoutHeights.header + statusHeight;
  const contentPaddingBottom = layoutHeights.input + keyboardOffset;

  return (
    <div
      className="fixed left-0 right-0 flex flex-col bg-gradient-to-b from-slate-50 to-white"
      style={{
        top: 0,
        height: availableHeight,
        minHeight: '100dvh',
        paddingTop: headerOffset,
        paddingBottom: keyboardOffset,
      }}
    >
      <header
        ref={headerRef}
        className="z-50 border-b border-slate-200/80 bg-white/98 backdrop-blur-md shadow-sm"
        style={{
          position: 'fixed',
          top: headerOffset,
          left: 0,
          right: 0,
          transform: 'translateZ(0)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full text-slate-600 hover:bg-slate-100"
              onClick={() => router.push('/support')}
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base font-semibold text-slate-900">Support Pizza King</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>En ligne</span>
                {ticketDisplay ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="font-medium text-slate-600">{ticketDisplay}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="hidden cursor-pointer items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1 text-xs font-medium text-orange-600 transition hover:border-orange-300 hover:bg-orange-100 sm:flex"
              onClick={handleCallUnavailable}
            >
              <PhoneOff className="h-3.5 w-3.5 text-orange-500" />
              <span>Les appels sont indisponibles dans votre région</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full text-orange-500 hover:bg-orange-50 sm:hidden"
              title="Les appels sont indisponibles dans votre région"
              aria-label="Les appels sont indisponibles dans votre région"
              onClick={handleCallUnavailable}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>

            <div className="relative">
              <Button
                ref={historyButtonRef}
                variant="ghost"
                size="icon"
                className={`h-9 w-9 shrink-0 rounded-full text-slate-600 transition hover:bg-slate-100 ${historyOpen ? 'bg-slate-100' : ''}`}
                aria-haspopup="true"
                aria-expanded={historyOpen}
                aria-label="Afficher l'historique des tickets"
                onClick={() => setHistoryOpen(prev => !prev)}
              >
                <History className="h-5 w-5" />
              </Button>

              {historyOpen ? (
                <div
                  ref={historyMenuRef}
                  className="absolute right-0 z-[120] mt-2 w-80 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
                >
                  <div className="max-h-[65vh] overflow-y-auto p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Historique des tickets
                      </p>
                      {historyLoading ? (
                        <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                          Chargement en cours…
                        </div>
                      ) : historyError ? (
                        <p className="py-4 text-sm text-red-600">{historyError}</p>
                      ) : historyOrder.some(status => historyGroups[status].length > 0) ? (
                        historyOrder.map(status =>
                          historyGroups[status].length > 0 ? (
                            <div key={status} className="mt-3">
                              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <span>{SUPPORT_STATUS_LABELS[status]}</span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                                  {historyGroups[status].length}
                                </span>
                              </div>
                              <div className="mt-2 space-y-2">
                                {historyGroups[status].map(historyTicket => {
                                  const badgeClasses = SUPPORT_STATUS_COLORS[status];
                                  const displayNumber =
                                    historyTicket.ticketNumber ||
                                    `#${historyTicket.id.slice(0, 8).toUpperCase()}`;
                                  const updatedAt =
                                    historyTicket.updatedAt ?? historyTicket.createdAt;
                                  return (
                                    <div
                                      key={historyTicket.id}
                                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-orange-300"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                          {displayNumber}
                                        </p>
                                        <Badge className={badgeClasses}>{SUPPORT_STATUS_LABELS[status]}</Badge>
                                      </div>
                                      <p className="mt-1 text-xs text-slate-500">
                                        Mis à jour {formatRelativeTime(updatedAt)}
                                      </p>
                                      {historyTicket.lastMessagePreview ? (
                                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                                          « {historyTicket.lastMessagePreview} »
                                        </p>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null
                        )
                      ) : (
                        <p className="py-4 text-sm text-slate-500">
                          Encore aucun ticket terminé. Tes conversations actives apparaîtront ici une fois clôturées.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Bientôt disponible
                      </p>
                      <div className="mt-3 space-y-2 text-sm">
                        <button
                          type="button"
                          disabled
                          className="flex w-full flex-col items-start gap-1 rounded-2xl border border-dashed border-slate-200 px-3 py-2 text-left text-slate-400"
                        >
                          <span className="font-medium text-slate-500">Programmer un rappel téléphonique</span>
                          <span className="text-[11px] uppercase text-orange-500">
                            Momentanément indisponible
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled
                          className="flex w-full flex-col items-start gap-1 rounded-2xl border border-dashed border-slate-200 px-3 py-2 text-left text-slate-400"
                        >
                          <span className="font-medium text-slate-500">Partager le ticket avec un proche</span>
                          <span className="text-[11px] uppercase text-orange-500">
                            Momentanément indisponible
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {isPending || isResolved ? (
        <div
          ref={statusRef}
          className="z-40 bg-white/95 backdrop-blur-sm"
          style={{
            position: 'fixed',
            top: headerOffset + layoutHeights.header,
            left: 0,
            right: 0,
            transform: 'translateZ(0)',
          }}
        >
          <div className="mx-auto w-full max-w-4xl px-4 py-2">
            {isPending ? (
              <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2">
                <div className="mt-0.5 rounded-full bg-blue-200 p-1">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Conversation en pause</p>
                  <p className="text-xs text-blue-700">Un agent reviendra vers toi dès que possible</p>
                </div>
              </div>
            ) : null}

            {isResolved ? (
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2">
                <div className="mt-0.5 rounded-full bg-slate-200 p-1">
                  <Check className="h-3 w-3 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Conversation clôturée</p>
                  <p className="text-xs text-slate-600">Cette conversation est résolue</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom,
        }}
      >
        <div className="mx-auto w-full max-w-4xl px-4 py-4">
          {loading ? (
            <LoadingState />
          ) : timeline.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                  {/* Séparateur de date */}
                  <div className="mb-6 flex items-center justify-center">
                    <div className="rounded-full bg-slate-100 px-4 py-1.5 shadow-sm">
                      <span className="text-xs font-medium text-slate-600">{group.date}</span>
                    </div>
                  </div>

                  {/* Messages du groupe */}
                  {group.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              ))}

              {agentTyping ? (
                <div className="mb-4">
                  <TypingIndicator name={agentTypingName} variant="agent" />
                </div>
              ) : null}

              <div ref={endRef} />
            </>
          )}
        </div>
      </div>

      <div
        ref={inputRef}
        className="flex-none border-t border-slate-200/80 bg-white/98 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: keyboardOffset,
          transform: 'translateZ(0)',
          paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
        }}
      >
        <div className="mx-auto w-full max-w-4xl">
          <div className="px-4 py-3">
            {error ? (
              <div className="mb-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="flex-1 text-sm text-red-700">{error}</p>
              </div>
            ) : null}

            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  rows={1}
                  placeholder={isResolved ? 'Cette conversation est clôturée' : 'Écris ton message…'}
                  disabled={isResolved}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-dashlane="false"
                  data-enable-grammarly="false"
                  inputMode="text"
                  enterKeyHint="send"
                  className="block w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                  style={{
                    fontSize: '16px',
                    minHeight: '44px',
                    maxHeight: '100px',
                    WebkitTextSizeAdjust: '100%',
                  }}
                />
              </div>
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={sending || !input.trim() || isResolved}
                aria-label="Envoyer"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-slate-400">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-orange-400/30 blur-xl" />
        <Pizza className="relative h-14 w-14 animate-spin text-orange-500" />
      </div>
      <p className="text-sm font-medium text-slate-600">Connexion au support…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-lg">
        <Pizza className="h-12 w-12 text-orange-600" />
      </div>
      <div className="max-w-sm space-y-2">
        <p className="text-lg font-semibold text-slate-900">Bienvenue sur le support</p>
        <p className="text-sm text-slate-500">
          Décris ton problème ou pose ta question, notre équipe est là pour t'aider
        </p>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: SupportMessage & {
    sender: 'user' | 'agent' | 'system';
    status?: 'pending' | 'sent' | 'delivered' | 'read';
    read?: boolean;
    isAutoReply?: boolean;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem || message.isAutoReply) {
    return (
      <div className="my-4 flex justify-center">
        <div className="max-w-[85%] rounded-xl bg-slate-100/80 px-4 py-2.5 text-center shadow-sm">
          <p className="text-xs leading-relaxed text-slate-600">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`group max-w-[85%] rounded-3xl px-5 py-3 shadow-sm transition-all active:scale-[0.98] ${
          isUser
            ? 'rounded-br-md bg-gradient-to-br from-orange-500 to-orange-600 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {message.text}
        </p>
        <div
          className={`mt-2 flex items-center justify-end gap-1.5 text-[11px] ${
            isUser ? 'text-orange-100' : 'text-slate-400'
          }`}
        >
          <span className="font-medium">{formatMessageTime(message.createdAt)}</span>
          {isUser ? <MessageStatusIcon message={message} /> : null}
        </div>
      </div>
    </div>
  );
}

function MessageStatusIcon({ message }: MessageBubbleProps) {
  if (message.status === 'pending') {
    return (
      <span className="relative flex items-center gap-1 opacity-80">
        {/* Horloge avec animation */}
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" className="animate-pulse" />
        </svg>
        {/* Mini barre de progression */}
        <span className="relative h-1 w-4 overflow-hidden rounded-full bg-white/30">
          <span className="absolute inset-0 animate-[loading_1s_ease-in-out_infinite] bg-white/60" style={{
            backgroundImage: 'linear-gradient(90deg, transparent, currentColor, transparent)',
            animation: 'loading 1s ease-in-out infinite',
          }} />
        </span>
      </span>
    );
  }

  if (message.status === 'sent') {
    return (
      <span className="flex items-center opacity-80">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }

  if (message.read || message.status === 'read') {
    return (
      <span className="flex items-center text-blue-200">
        <CheckCheck className="h-3.5 w-3.5" />
      </span>
    );
  }

  // Delivered (par défaut)
  return (
    <span className="flex items-center opacity-80">
      <CheckCheck className="h-3.5 w-3.5" />
    </span>
  );
}
