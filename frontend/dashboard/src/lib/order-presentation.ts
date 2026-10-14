import type { OrderStatusUpdate } from '@findeg/orders/types';
import {
  ORDER_STATUS_TRANSITIONS,
  changePaymentStatus,
  type OrderStatus,
  type PaymentStatus,
  type OrderProgress,
} from '@findeg/domain';

const orderLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};
const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  refunded: 'Refunded',
};
export const getOrderStatusLabel = (status: OrderStatus) => orderLabels[status];
export const getPaymentStatusLabel = (status: PaymentStatus) => paymentLabels[status];
export const getAllowedOrderStatusTransitions = (status: OrderStatus) =>
  ORDER_STATUS_TRANSITIONS[status];
/** Refund has its own command; payment controls only offer moves the Domain accepts. */
export function getAllowedPaymentStatusTransitions(order: OrderProgress): PaymentStatus[] {
  try {
    return changePaymentStatus(order, 'paid').changed ? ['paid'] : [];
  } catch {
    return [];
  }
}

/** Staff must explicitly confirm cancellation, and the parcel fact before a shipped cancellation. */
export function confirmStatusUpdate(
  from: OrderStatus,
  status: OrderStatus,
  messages: { parcelBack: string; cancel: string },
): OrderStatusUpdate | null {
  if (status === 'cancelled') {
    if (from === 'shipped') {
      return window.confirm(messages.parcelBack) ? { status, parcelBackInWarehouse: true } : null;
    }
    return window.confirm(messages.cancel) ? { status } : null;
  }
  return { status };
}
