import type { OrderStatus } from '../../../orders';
import { InventoryError } from '../../helpers';
import { STATE_BY_ORDER_STATUS } from './constants';
import type { ReservationSettlement, ReservationState } from './types';

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
