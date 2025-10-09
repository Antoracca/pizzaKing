import { OrderStatus } from '../types';

export const ORDER_STATUS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  out_for_delivery: 'En livraison',
  delivered: 'Livrée',
  completed: 'Terminée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#FFA500',
  confirmed: '#4169E1',
  preparing: '#FF8C00',
  ready: '#32CD32',
  out_for_delivery: '#1E90FF',
  delivered: '#228B22',
  completed: '#008000',
  cancelled: '#DC143C',
  refunded: '#B22222',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'completed',
];

export const ORDER_STATUS_PICKUP_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
];
