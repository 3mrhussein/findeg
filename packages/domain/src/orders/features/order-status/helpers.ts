import { reservationSettlement } from '../../../inventory';
import { OrderError } from '../../helpers';
import { ORDER_STATUS_TRANSITIONS, PAYMENT_STATUS_TRANSITIONS } from './constants';
import type {
  OrderProgress,
  OrderProgressChange,
  OrderStatus,
  OrderStatusAssertions,
  PaymentStatus,
} from './types';

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
