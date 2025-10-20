'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminSupportTickets } from '@/hooks/useAdminSupportTickets';
import {
  Clock3,
  Filter,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { SupportTicketStatus } from '@pizza-king/shared';

const STATUS_OPTIONS: Array<{
  value: SupportTicketStatus | 'all';
  label: string;
}> = [
  { value: 'open', label: 'Ouverts' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'resolved', label: 'Résolus' },
  { value: 'all', label: 'Tous' },
];

function formatRelative(date: Date | null | undefined): string {
  if (!date) return '—';
  const diff = Date.now() - date.getTime();

  if (diff < 60_000) return 'À l’instant';
  if (diff < 3_600_000) {
    const minutes = Math.floor(diff / 60_000);
    return `Il y a ${minutes} min`;
  }
  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000);
    return `Il y a ${hours} h`;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>(
    'open'
  );
  const { tickets, loading, error } = useAdminSupportTickets(statusFilter);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (tickets.length === 0) {
      setSelectedTicketId(null);
      return;
    }

    if (!selectedTicketId || !tickets.some(ticket => ticket.id === selectedTicketId)) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const counts = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(ticket => ticket.status === 'open').length,
      inProgress: tickets.filter(ticket => ticket.status === 'in_progress').length,
      resolved: tickets.filter(ticket => ticket.status === 'resolved').length,
      unassigned: tickets.filter(ticket => !ticket.assignedAgentId).length,
      unreadForAgent: tickets.reduce(
        (acc, ticket) => acc + (ticket.unreadCountForAgent ?? 0),
        0
      ),
    };
  }, [tickets]);

  const activeTicket =
    tickets.find(ticket => ticket.id === selectedTicketId) || tickets[0] || null;
  const activeCustomer = activeTicket?.customer ?? null;
  const activeUpdatedAt =
    activeTicket?.lastMessageAt?.toDate?.() ??
    activeTicket?.updatedAt?.toDate?.() ??
    activeTicket?.createdAt?.toDate?.();

  const statCards = [
    {
      label: 'Tickets visibles',
      value: `${counts.total}`,
      trend:
        statusFilter === 'all'
          ? 'Tous les statuts'
          : `Filtre : ${
              statusFilter === 'open'
                ? 'Ouverts'
                : statusFilter === 'in_progress'
                ? 'En cours'
                : 'Résolus'
            }`,
    },
    {
      label: 'Tickets non assignés',
      value: `${counts.unassigned}`,
      trend: `${counts.open} ouverts · ${counts.inProgress} en cours`,
    },
    {
      label: 'Messages non lus',
      value: `${counts.unreadForAgent}`,
      trend:
        counts.unreadForAgent > 0
          ? 'Réponses attendues côté support'
          : 'Aucun message en attente',
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                Support client
              </h1>
              <p className="text-sm text-slate-500 sm:text-base">
                Suivi des conversations en cours et attribution des tickets.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
              <Button size="sm" className="gap-2 bg-orange-500 text-white">
                <ShieldCheck className="h-4 w-4" />
                Mode prioritaire
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {statCards.map(card => (
              <SupportStat
                key={card.label}
                label={card.label}
                value={card.value}
                trend={card.trend}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <aside className="flex w-full flex-col gap-4 sm:w-80">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Files d’attente
                </h2>
                <Badge variant="outline" className="border-orange-200 text-orange-600">
                  Ouverts {counts.open}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={statusFilter === option.value ? 'secondary' : 'ghost'}
                    className="justify-center"
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between px-4 py-3">
                <div className="text-sm font-semibold text-slate-700">
                  Conversations ({counts.total})
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600">
                  Temps réel
                </Badge>
              </header>
              {error ? (
                <div className="mx-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              ) : null}
              <div className="flex-1 overflow-y-auto">
                {loading && counts.total === 0 ? (
                  <div className="flex h-32 items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des conversations…
                  </div>
                ) : counts.total === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-400">
                    <MessageSquare className="h-6 w-6 text-orange-300" />
                    Aucune conversation pour l’instant.
                  </div>
                ) : (
                  tickets.map(ticket => {
                    const updated =
                      ticket.lastMessageAt?.toDate?.() ??
                      ticket.updatedAt?.toDate?.() ??
                      ticket.createdAt?.toDate?.();

                    return (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={`flex w-full flex-col gap-2 border-t border-slate-100 px-4 py-3 text-left transition ${
                          ticket.id === activeTicket?.id
                            ? 'bg-orange-50/80'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {ticket.userDisplayName || 'Client Pizza King'}
                            </span>
                            <Badge
                              className={
                                ticket.status === 'open'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : ticket.status === 'in_progress'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-slate-100 text-slate-600'
                              }
                            >
                              {ticket.status === 'open'
                                ? 'Ouvert'
                                : ticket.status === 'in_progress'
                                ? 'En cours'
                                : 'Résolu'}
                            </Badge>
                          </div>
                          {ticket.unreadCountForAgent ? (
                            <Badge className="bg-red-500 text-white">
                              {ticket.unreadCountForAgent}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="line-clamp-2 text-xs text-slate-500">
                          {ticket.lastMessagePreview || 'Pas encore de message'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatRelative(updated)}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <section className="flex w-full flex-1 flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            {activeTicket ? (
              <>
                <header className="flex flex-col gap-4 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {activeTicket.userDisplayName || 'Client Pizza King'}
                      </h2>
                      <p className="text-sm text-slate-500">
                        Ticket {activeTicket.id} · {formatRelative(activeUpdatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        Fidélité&nbsp;: {activeCustomer?.loyaltyPoints ?? 0} pts
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        Commandes&nbsp;: {activeCustomer?.totalOrders ?? 0}
                      </Badge>
                      <Button size="sm" variant="outline" className="gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Clôturer
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ContactItem
                      icon={Mail}
                      label="Email"
                      value={activeCustomer?.email ?? '—'}
                    />
                    <ContactItem
                      icon={Phone}
                      label="Téléphone"
                      value={activeCustomer?.phoneNumber ?? '—'}
                    />
                    <ContactItem
                      icon={User}
                      label="Agent"
                      value={activeTicket.assignedAgentName || 'Non assigné'}
                    />
                    <ContactItem
                      icon={Clock3}
                      label="Dernière activité"
                      value={formatRelative(activeUpdatedAt)}
                    />
                  </div>
                </header>

                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-slate-400">
                  <MessageSquare className="h-10 w-10 text-orange-300" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-600">
                      Conversation en attente
                    </p>
                    <p className="text-sm">
                      La timeline détaillée apparaîtra ici une fois connectée au flux.
                    </p>
                  </div>
                  {loading ? (
                    <Button className="gap-2 bg-orange-500 text-white hover:bg-orange-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement de la conversation…
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-slate-400">
                <MessageSquare className="h-10 w-10 text-orange-300" />
                <p className="font-medium text-slate-600">
                  Sélectionne une conversation dans la liste.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function SupportStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {trend ? <p className="text-xs text-slate-400">{trend}</p> : null}
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <Icon className="h-4 w-4 text-orange-500" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-sm text-slate-700">{value || '—'}</p>
      </div>
    </div>
  );
}
