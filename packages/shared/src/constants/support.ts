import type { SupportTicketStatus } from '../types/support';

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  pending: 'En attente',
  resolved: 'Résolu',
};

export const SUPPORT_STATUS_COLORS: Record<SupportTicketStatus, string> = {
  open: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-600 border-amber-200',
  pending: 'bg-blue-50 text-blue-600 border-blue-200',
  resolved: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const AUTO_REPLY_FIRST_MESSAGE =
  'Merci pour votre message ! Un agent vous répondra dans les plus brefs délais.';

export const TYPING_INDICATOR_TIMEOUT = 1500; // ms
