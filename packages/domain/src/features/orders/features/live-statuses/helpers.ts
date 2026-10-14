import type { OrderStatus } from '../order-status';
import { LIVE_ORDER_STATUSES } from './constants';

/** Whether an Order in `status` is live: neither cancelled nor refunded. */
export function isLiveOrderStatus(status: OrderStatus): boolean {
  return (LIVE_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}
