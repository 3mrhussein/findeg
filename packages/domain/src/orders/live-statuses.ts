import type { OrderStatus } from '.';

/**
 * The "live" Order statuses: every status but cancelled and refunded. Only live Orders count in
 * Partner Reports and as a verified purchase.
 */
export const LIVE_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
] as const satisfies readonly OrderStatus[];

/** Whether an Order in `status` is live: neither cancelled nor refunded. */
export function isLiveOrderStatus(status: OrderStatus): boolean {
  return (LIVE_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}
