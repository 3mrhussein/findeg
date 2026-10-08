export const ORDER_STATUS_KIND = 'order-status';

/** Statuses that notify the customer; one email per status per order. */
export const NOTIFIED_ORDER_STATUSES = ['shipped', 'delivered', 'cancelled'] as const;
export type NotifiedOrderStatus = (typeof NOTIFIED_ORDER_STATUSES)[number];

export const isNotifiedOrderStatus = (status: string): status is NotifiedOrderStatus =>
  (NOTIFIED_ORDER_STATUSES as readonly string[]).includes(status);

/** Row id for a status email: one per Order Reference and status. */
export const orderStatusId = (orderReference: string, status: NotifiedOrderStatus) =>
  `${ORDER_STATUS_KIND}:${orderReference}:${status}`;

export interface OrderStatusPayload {
  orderId: number;
  status: NotifiedOrderStatus;
}
