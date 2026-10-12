import type { OrderStatus } from '../orders';
import { InventoryError } from './inventory-error';

/**
 * Where an Order's Stock Reservation stands. It is never stored: it follows from the Order
 * status (ADR-0005). It is held from Order Acceptance, consumed on delivery (the units leave
 * the warehouse) and released on cancellation (the units can be sold again).
 */
export const RESERVATION_STATES = ['held', 'consumed', 'released'] as const;
export type ReservationState = (typeof RESERVATION_STATES)[number];

/** How a held reservation is settled: `consume` lowers on hand and reserved, `release` only reserved. */
export type ReservationSettlement = 'consume' | 'release';

const STATE_BY_ORDER_STATUS: Readonly<Record<OrderStatus, ReservationState>> = {
  pending: 'held',
  confirmed: 'held',
  processing: 'held',
  shipped: 'held',
  delivered: 'consumed',
  cancelled: 'released',
  // A refund has no stock effect: restocking a returned item is a manual adjustment.
  refunded: 'consumed',
};

/** The state of an Order's Stock Reservation while the Order has this status. */
export function reservationState(status: OrderStatus): ReservationState {
  return STATE_BY_ORDER_STATUS[status];
}

/**
 * The stock effect of moving an Order from one status to another: `consume` on delivery,
 * `release` on cancellation, and `null` when the reservation does not change (including a
 * same-status change and a refund). Whether the move itself is allowed is the Order's rule; a
 * reservation already settled one way is never settled the other way.
 */
export function reservationSettlement(
  from: OrderStatus,
  to: OrderStatus,
): ReservationSettlement | null {
  const before = reservationState(from);
  const after = reservationState(to);
  if (before === after) return null;
  if (before !== 'held') {
    throw new InventoryError(
      'RESERVATION_ALREADY_SETTLED',
      `The Stock Reservation of a ${from} Order was already ${before}; moving to ${to} cannot make it ${after}`,
    );
  }
  return after === 'consumed' ? 'consume' : 'release';
}
