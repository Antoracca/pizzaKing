import { Timestamp } from 'firebase/firestore';

export type NotificationType =
  | 'order_update'
  | 'promotion'
  | 'loyalty'
  | 'system';

export type NotificationActionType =
  | 'open_order'
  | 'open_promo'
  | 'open_app'
  | 'none';

export interface NotificationChannels {
  push: boolean;
  sms: boolean;
  email: boolean;
  whatsapp: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  imageUrl?: string;
  type: NotificationType;
  actionType?: NotificationActionType;
  actionData?: any;
  channels: NotificationChannels;
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
  createdAt: Timestamp;
  isRead: boolean;
}
