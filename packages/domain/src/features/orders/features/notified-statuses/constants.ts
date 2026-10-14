import type { OrderStatus } from '../order-status';

/**
 * The Order statuses a Customer is told about (CO-16): one message per status per Order. There is
 * no refund message.
 */
export const NOTIFIED_ORDER_STATUSES = [
  'shipped',
  'delivered',
  'cancelled',
] as const satisfies readonly OrderStatus[];
