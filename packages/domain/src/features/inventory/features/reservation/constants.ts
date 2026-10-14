import type { OrderStatus } from '../../../orders';
import type { ReservationState } from './types';

export const RESERVATION_STATES = ['held', 'consumed', 'released'] as const;

export const STATE_BY_ORDER_STATUS: Readonly<Record<OrderStatus, ReservationState>> = {
  pending: 'held',
  confirmed: 'held',
  processing: 'held',
  shipped: 'held',
  delivered: 'consumed',
  cancelled: 'released',
  // A refund has no stock effect: restocking a returned item is a manual adjustment.
  refunded: 'consumed',
};
