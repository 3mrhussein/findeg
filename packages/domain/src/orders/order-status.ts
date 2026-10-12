import { reservationSettlement, type ReservationSettlement } from '../inventory';
import { ORDER_STATUS_TRANSITIONS, type Order, type OrderStatus } from './index';
import { OrderError } from './order-error';

/** Where an Order stands: its status and its payment status. */
export type OrderProgress = Pick<Order, 'status' | 'paymentStatus'>;

/** The outcome of a status change: the new statuses, whether anything changed, and the stock effect. */
export interface OrderProgressChange extends OrderProgress {
  changed: boolean;
  /** How the Stock Reservation is settled by this change, if at all (ADR-0005). */
  stockSettlement: ReservationSettlement | null;
}

/** Facts Staff assert when they change an Order's status. */
export interface OrderStatusAssertions {
  /** The parcel of a shipped Order is back in the warehouse, so it can be cancelled (ADR-0005). */
  parcelBackInWarehouse?: boolean;
}

/**
 * Moves an Order to another status (ADR-0016). A same-status change is a no-op; any move not in
 * `ORDER_STATUS_TRANSITIONS` is refused. Cancelling a shipped Order needs the assertion that its
 * parcel is back in the warehouse.
 */
export function changeOrderStatus(
  order: OrderProgress,
  to: OrderStatus,
  assertions: OrderStatusAssertions = {},
): OrderProgressChange {
  const from = order.status;
  if (from === to) return { ...progressOf(order), changed: false, stockSettlement: null };
  if (!ORDER_STATUS_TRANSITIONS[from].includes(to)) {
    throw new OrderError(
      'INVALID_ORDER_STATUS_TRANSITION',
      `An Order cannot move from ${from} to ${to}`,
    );
  }
  if (from === 'shipped' && to === 'cancelled' && assertions.parcelBackInWarehouse !== true) {
    throw new OrderError(
      'SHIPPED_CANCELLATION_NEEDS_PARCEL_BACK',
      'A shipped Order is cancelled only once its parcel is back in the warehouse',
    );
  }
  return {
    status: to,
    paymentStatus: order.paymentStatus,
    changed: true,
    stockSettlement: reservationSettlement(from, to),
  };
}

function progressOf({ status, paymentStatus }: OrderProgress): OrderProgress {
  return { status, paymentStatus };
}
