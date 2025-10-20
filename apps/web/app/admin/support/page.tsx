'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminSupportTickets } from '@/hooks/useAdminSupportTickets';
import AdminSupportConversation from '@/components/support/AdminSupportConversation';
import { useAuth } from '@pizza-king/shared/src/hooks/useAuth';
import type { SupportTicketStatus } from '@pizza-king/shared/src/types/support';
import type { User } from '@pizza-king/shared/src/types/user';
import {
  Clock3,
  Filter,
  MessageSquare,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import { SUPPORT_STATUS_LABELS, SUPPORT_STATUS_COLORS } from '@pizza-king/shared/src/constants/support';
import { formatRelativeTime } from '@/lib/support-utils';

type ViewMode = 'unassigned' | 'mine' | 'all';

const STATUS_OPTIONS: Array<{
  value: SupportTicketStatus | 'all';
  label: string;
}> = [
  { value: 'all', label: 'Tous' },
  { value: 'open', label: 'Ouverts' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'pending', label: 'En attente' },
  { value: 'resolved', label: 'Résolus' },
];

export default function AdminSupportPage() {
  const router = useRouter();
  const { user: authUser, isAdmin, loading: authLoading } = useAuth();
  const enabled = !authLoading && Boolean(isAdmin && authUser);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/auth/login?redirect=/admin/support');
    }
  }, [authLoading, isAdmin, router]);

  if (!enabled || !authUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p>Vérification des droits d'accès…</p>
        </div>
      </main>
    );
  }

  return <SupportAdminShell currentUser={authUser} />;
}

interface SupportAdminShellProps {
  currentUser: User;
}

function SupportAdminShell({ currentUser }: SupportAdminShellProps) {
  console.log('Support admin user', currentUser.id, currentUser.role);
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('unassigned');
  const router = useRouter();
  const { signOut } = useAuth();

  const { tickets, unassignedTickets, myTickets, loading, error } = useAdminSupportTickets(
    statusFilter,
    currentUser?.id
  );

  const displayedTickets = useMemo(() => {
    if (viewMode === 'unassigned') return unassignedTickets;
    if (viewMode === 'mine') return myTickets;
    return tickets;
  }, [viewMode, unassignedTickets, myTickets, tickets]);

  useEffect(() => {
    if (displayedTickets.length === 0) {
      setSelectedTicketId(null);
      return;
    }

    if (
      !selectedTicketId ||
      !displayedTickets.some(ticket => ticket.id === selectedTicketId)
    ) {
      setSelectedTicketId(displayedTickets[0].id);
    }
  }, [displayedTickets, selectedTicketId]);

  const counts = useMemo(() => {
    return {
      total: tickets.length,
      unassigned: unassignedTickets.length,
      mine: myTickets.length,
      open: tickets.filter(ticket => ticket.status === 'open').length,
      inProgress: tickets.filter(ticket => ticket.status === 'in_progress').length,
      pending: tickets.filter(ticket => ticket.status === 'pending').length,
      resolved: tickets.filter(ticket => ticket.status === 'resolved').length,
      unreadForAgent: tickets.reduce(
        (acc, ticket) => acc + (ticket.unreadCountForAgent ?? 0),
        0
      ),
    };
  }, [tickets, unassignedTickets, myTickets]);

  const activeTicket =
    displayedTickets.find(ticket => ticket.id === selectedTicketId) || null;

  const statCards = [
    {
      label: 'Nouvelles conversations',
      value: `${counts.unassigned}`,
      trend: 'Non assignées',
      icon: ShieldAlert,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Mes conversations',
      value: `${counts.mine}`,
      trend: 'Assignées à moi',
      icon: UserPlus,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Messages non lus',
      value: `${counts.unreadForAgent}`,
      trend:
        counts.unreadForAgent > 0
          ? 'Réponses en attente'
          : 'Toutes les conversations sont à jour',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                Support client
              </h1>
              <p className="text-sm text-slate-500 sm:text-base">
                Gestion des conversations en temps réel
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm sm:flex">
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-slate-800">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <span className="text-xs text-slate-400">Super admin</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    router.push('/auth/login');
                  }}
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
          <div className="sm:hidden">
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-center"
              onClick={async () => {
                await signOut();
                router.push('/auth/login');
              }}
            >
              Se déconnecter
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {statCards.map(card => (
              <SupportStat
                key={card.label}
                label={card.label}
                value={card.value}
                trend={card.trend}
                icon={card.icon}
                color={card.color}
                bgColor={card.bgColor}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex-1">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <aside className="flex w-full flex-col gap-4 sm:w-80">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Vue
              </h2>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'unassigned' ? 'default' : 'ghost'}
                  className={`justify-start ${
                    viewMode === 'unassigned' ? 'bg-red-500 hover:bg-red-600' : ''
                  }`}
                  onClick={() => setViewMode('unassigned')}
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Nouvelles ({counts.unassigned})
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'mine' ? 'default' : 'ghost'}
                  className={`justify-start ${
                    viewMode === 'mine' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                  }`}
                  onClick={() => setViewMode('mine')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Mes conversations ({counts.mine})
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'all' ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => setViewMode('all')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Toutes ({counts.total})
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Statut
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={statusFilter === option.value ? 'secondary' : 'ghost'}
                    className="justify-center text-xs"
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="text-sm font-semibold text-slate-700">
                  {viewMode === 'unassigned'
                    ? 'Nouvelles'
                    : viewMode === 'mine'
                    ? 'Mes conversations'
                    : 'Conversations'}{' '}
                  ({displayedTickets.length})
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
                {loading && displayedTickets.length === 0 ? (
                  <LoadingState />
                ) : displayedTickets.length === 0 ? (
                  <EmptyState viewMode={viewMode} />
                ) : (
                  displayedTickets.map(ticket => {
                    const updated =
                      ticket.lastMessageAt ?? ticket.updatedAt ?? ticket.createdAt;

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
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {ticket.userDisplayName || ticket.customer?.email || 'Client'}
                            </span>
                            <StatusBadge status={ticket.status} />
                          </div>
                          {ticket.unreadCountForAgent ? (
                            <Badge className="h-5 shrink-0 bg-red-500 text-[10px] text-white">
                              {ticket.unreadCountForAgent}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="line-clamp-2 text-xs text-slate-500">
                          {ticket.lastMessagePreview || 'Pas encore de message'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatRelativeTime(updated)}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <section className="flex w-full flex-1 flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <AdminSupportConversation
              ticketId={activeTicket?.id ?? null}
              agent={currentUser}
              customer={activeTicket?.customer ?? null}
            />
          </section>
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  return (
    <Badge className={`text-[10px] ${SUPPORT_STATUS_COLORS[status]}`}>
      {SUPPORT_STATUS_LABELS[status]}
    </Badge>
  );
}

function LoadingState() {
  return (
    <div className="flex h-32 items-center justify-center gap-2 text-slate-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      Chargement des conversations…
    </div>
  );
}

function EmptyState({ viewMode }: { viewMode: ViewMode }) {
  const message =
    viewMode === 'unassigned'
      ? 'Aucune nouvelle conversation'
      : viewMode === 'mine'
      ? 'Aucune conversation assignée à toi'
      : 'Aucune conversation pour l\'instant';

  return (
    <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-400">
      <MessageSquare className="h-6 w-6 text-orange-300" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function SupportStat({
  label,
  value,
  trend,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  trend?: string;
  icon: ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl ${bgColor} p-3`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          {trend ? <p className="mt-0.5 text-xs text-slate-400">{trend}</p> : null}
        </div>
      </div>
    </div>
  );
}
