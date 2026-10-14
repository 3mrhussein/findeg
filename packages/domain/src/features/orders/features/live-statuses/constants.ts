import type { OrderStatus } from '../order-status';

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
