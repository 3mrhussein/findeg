import type { OrderStatus } from '@findeg/backend/features/core';

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  // Staff cancel a shipped Order only once the parcel is back in the warehouse (ADR-0005).
  shipped: ['delivered', 'cancelled'],
  // Phase one is cash on delivery, so nothing is refunded before delivery (ADR-0005).
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

/**
 * Safely coerces unknown status values into a known status.
 */
export function normalizeOrderStatus(status: string): OrderStatus {
  return ORDER_STATUS_OPTIONS.includes(status as OrderStatus) ? (status as OrderStatus) : 'pending';
}

/**
 * Returns possible transitions from a given current status.
 */
export function getAllowedOrderStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Validates whether a transition is permitted.
 */
export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return getAllowedOrderStatusTransitions(from).includes(to);
}

/**
 *
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}
