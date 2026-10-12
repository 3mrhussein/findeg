import { reservationSettlement, type ReservationSettlement } from '../inventory';
import type { Order } from './index';
import { OrderError } from './order-error';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Every status an Order may move to from each status. */
export const ORDER_STATUS_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  // A shipped Order is cancelled only once its parcel is back in the warehouse (ADR-0005).
  shipped: ['delivered', 'cancelled'],
  // Phase one is cash on delivery, so a refund only follows delivery (ADR-0005).
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_TRANSITIONS: Readonly<Record<PaymentStatus, readonly PaymentStatus[]>> =
  {
    unpaid: ['paid'],
    paid: ['refunded'],
    refunded: [],
  };

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
 * parcel is back in the warehouse, and moving to `refunded` is a Refund (see `refundOrder`).
 */
export function changeOrderStatus(
  order: OrderProgress,
  to: OrderStatus,
  assertions: OrderStatusAssertions = {},
): OrderProgressChange {
  const from = order.status;
  if (from === to) return unchanged(order);
  requireOrderMove(from, to);
  if (to === 'refunded') return refundOrder(order);
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

/**
 * Records a payment status (ADR-0016). A same-status change is a no-op; any move not in
 * `PAYMENT_STATUS_TRANSITIONS` is refused. Cash is collected on delivery, so `paid` needs a
 * delivered Order; a payment is refunded only by refunding its Order (`refundOrder`).
 */
export function changePaymentStatus(order: OrderProgress, to: PaymentStatus): OrderProgressChange {
  const from = order.paymentStatus;
  if (from === to) return unchanged(order);
  if (!PAYMENT_STATUS_TRANSITIONS[from].includes(to)) {
    throw new OrderError(
      'INVALID_PAYMENT_STATUS_TRANSITION',
      `A payment cannot move from ${from} to ${to}`,
    );
  }
  if (to === 'refunded') {
    throw new OrderError(
      'PAYMENT_REFUND_NEEDS_ORDER_REFUND',
      'A payment is refunded only together with its Order',
    );
  }
  if (order.status !== 'delivered') {
    throw new OrderError(
      'PAID_BEFORE_DELIVERY',
      `A payment becomes paid only once the Order is delivered; this Order is ${order.status}`,
    );
  }
  return { status: order.status, paymentStatus: to, changed: true, stockSettlement: null };
}

/**
 * The Refund: a delivered, paid Order and its payment both become `refunded`, or neither does.
 * Refunding a refunded Order is a no-op. A refund has no stock effect.
 */
export function refundOrder(order: OrderProgress): OrderProgressChange {
  if (order.status === 'refunded' && order.paymentStatus === 'refunded') return unchanged(order);
  requireOrderMove(order.status, 'refunded');
  if (order.paymentStatus !== 'paid') {
    throw new OrderError(
      'REFUND_NEEDS_PAID_ORDER',
      `Only a paid Order is refunded; this Order's payment is ${order.paymentStatus}`,
    );
  }
  return { status: 'refunded', paymentStatus: 'refunded', changed: true, stockSettlement: null };
}

function requireOrderMove(from: OrderStatus, to: OrderStatus): void {
  if (!ORDER_STATUS_TRANSITIONS[from].includes(to)) {
    throw new OrderError(
      'INVALID_ORDER_STATUS_TRANSITION',
      `An Order cannot move from ${from} to ${to}`,
    );
  }
}

function unchanged({ status, paymentStatus }: OrderProgress): OrderProgressChange {
  return { status, paymentStatus, changed: false, stockSettlement: null };
}
