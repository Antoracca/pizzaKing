'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Headset, Pizza, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@pizza-king/shared';
import { useSupportChat } from '@/hooks/useSupportChat';
import type { SupportTicketStatus } from '@pizza-king/shared';
import { Timestamp } from 'firebase/firestore';

const statusLabels: Record<SupportTicketStatus, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
};

const statusStyles: Record<SupportTicketStatus, string> = {
  open: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border border-amber-200',
  resolved: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const formatTimestamp = (timestamp: Timestamp | null | undefined) => {
  try {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '';
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp.toDate());
  } catch {
    return '';
  }
};

const ChatLoader = () => (
  <div className="flex h-full flex-col items-center justify-center gap-4 text-orange-500">
    <div className="relative flex h-14 w-14 items-center justify-center">
      <Pizza className="h-10 w-10 animate-spin text-orange-500" />
      <div className="absolute inset-0 rounded-full bg-orange-300/30 blur-xl" />
    </div>
    <div className="flex gap-1.5">
      {[0, 1, 2].map(dot => (
        <span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-bounce"
          style={{ animationDelay: `${dot * 120}ms` }}
        />
      ))}
    </div>
    <p className="text-sm text-slate-500">Connexion au support…</p>
  </div>
);

export default function SupportChat() {
  const router = useRouter();
  const { user } = useAuth();
  const { ticket, messages, loading, sending, error, sendMessage } =
    useSupportChat(user);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    await sendMessage(trimmed);
    setInput('');
  }, [input, sendMessage]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await handleSend();
    },
    [handleSend]
  );

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        await handleSend();
      }
    },
    [handleSend]
  );

  const ticketLabel = useMemo(() => {
    if (!ticket) return '';
    return `Ticket ${ticket.id.slice(0, 6).toUpperCase()}`;
  }, [ticket]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl flex-col bg-white sm:min-h-[calc(100vh-8rem)] sm:overflow-hidden sm:rounded-3xl sm:border sm:border-orange-100 sm:shadow-xl">
      <header className="flex items-center justify-between gap-3 border-b border-orange-100 px-3 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-orange-600 hover:bg-orange-50"
            onClick={() => router.push('/support')}
            aria-label="Retour au support"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Headset className="h-5 w-5 text-orange-500" />
              <h1 className="text-lg font-semibold text-slate-900">
                Support Pizza King
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Un agent prend en charge ta demande et te répond dès que possible.
            </p>
          </div>
        </div>
        {ticket ? (
          <Badge className={`hidden sm:inline-flex ${statusStyles[ticket.status]}`}>
            {statusLabels[ticket.status]}
          </Badge>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col bg-orange-50/40">
        {ticket ? (
          <div className="border-b border-orange-100 px-3 py-2 sm:hidden">
            <Badge className={statusStyles[ticket.status]}>
              {statusLabels[ticket.status]}
            </Badge>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
          {loading ? (
            <ChatLoader />
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
              <Headset className="h-10 w-10 text-orange-400" />
              <p className="text-sm">
                Décris ton problème ci-dessous, un agent te répondra très vite.
              </p>
            </div>
          ) : (
            <>
              {messages.map(message => {
                const isUserMessage = message.sender === 'user';
                return (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow ${
                        isUserMessage
                          ? 'bg-orange-500 text-white'
                          : 'bg-white text-slate-800 border border-orange-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      <span
                        className={`mt-2 block text-xs ${
                          isUserMessage ? 'text-orange-100/90' : 'text-slate-400'
                        }`}
                      >
                        {isUserMessage ? 'Vous' : 'Support'} ·{' '}
                        {formatTimestamp(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-orange-100 bg-white px-3 py-4 sm:px-6"
        >
          {error ? (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : null}
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Décris ton problème ou pose ta question…"
                className="w-full resize-none rounded-2xl border border-orange-200 bg-orange-50/50 px-4 py-3 text-base text-slate-800 shadow-inner focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200/60 sm:text-sm"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 rounded-2xl bg-orange-500 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              disabled={sending || !input.trim()}
              aria-label="Envoyer le message"
            >
              {sending ? <Pizza className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>{ticketLabel}</span>
            <span>Nos agents peuvent te recontacter par téléphone si nécessaire.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
