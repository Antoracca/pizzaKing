import { Timestamp } from 'firebase/firestore';

export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'pending'
  | 'resolved';

export type SupportChannel = 'chat';

export type SupportMessageSender = 'user' | 'agent' | 'system';

export type SupportMessageDeliveryStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read';

export interface SupportTicket {
  id: string;
  ticketNumber?: string; // Numéro lisible unique (ex: "PK-2025-A7B3")
  userId: string;
  userDisplayName?: string;
  status: SupportTicketStatus;
  channel: SupportChannel;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessageAt?: Timestamp | null;
  lastMessagePreview?: string | null;
  lastMessageSender?: SupportMessageSender | null;
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  assignedAt?: Timestamp | null;
  unreadCountForAgent?: number;
  unreadCountForUser?: number;
  resolvedAt?: Timestamp | null;
  resolvedByAgentId?: string | null;
  resolvedByAgentName?: string | null;
  autoReplySent?: boolean; // Message automatique de confirmation envoyé
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  sender: SupportMessageSender;
  senderId?: string | null;
  text: string;
  createdAt: Timestamp;
  read?: boolean; // Lu par le destinataire
  readAt?: Timestamp | null; // Date de lecture
  acknowledgedAt?: Timestamp | null; // DEPRECATED: Utiliser readAt
  status?: SupportMessageDeliveryStatus;
  clientMessageId?: string | null;
  isAutoReply?: boolean; // Message automatique système
}

export interface SupportPresence {
  typing: boolean;
  lastSeenAt: Timestamp;
  online?: boolean;
  device?: 'web' | 'mobile' | 'admin';
  displayName?: string;
}

export type SupportEventType =
  | 'agent_joined'
  | 'user_joined'
  | 'agent_typing'
  | 'user_typing'
  | 'ticket_pending'
  | 'ticket_resolved'
  | 'ticket_reopened';

export interface SupportEvent {
  id: string;
  type: SupportEventType;
  createdAt: Timestamp;
  actorId?: string | null;
  actorName?: string | null;
  metadata?: Record<string, unknown>;
}
