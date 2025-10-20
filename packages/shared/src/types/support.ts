import { Timestamp } from 'firebase/firestore';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';
export type SupportChannel = 'chat';
export type SupportMessageSender = 'user' | 'agent' | 'system';

export interface SupportTicket {
  id: string;
  userId: string;
  status: SupportTicketStatus;
  channel: SupportChannel;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessageAt?: Timestamp;
  lastMessagePreview?: string;
  assignedAgentId?: string | null;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  sender: SupportMessageSender;
  senderId?: string | null;
  text: string;
  createdAt: Timestamp;
  read?: boolean;
}
