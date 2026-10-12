import type { OrderStatus } from '.';

/**
 * The Order statuses a Customer is told about (CO-16): one message per status per Order. There is
 * no refund message.
 */
export const NOTIFIED_ORDER_STATUSES = [
  'shipped',
  'delivered',
  'cancelled',
] as const satisfies readonly OrderStatus[];
export type NotifiedOrderStatus = (typeof NOTIFIED_ORDER_STATUSES)[number];

/** Whether moving an Order to `status` notifies its Customer. */
export function isNotifiedOrderStatus(status: OrderStatus): status is NotifiedOrderStatus {
  return (NOTIFIED_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}
