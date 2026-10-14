import type { OrderStatus } from '../order-status';
import { NOTIFIED_ORDER_STATUSES } from './constants';
import type { NotifiedOrderStatus } from './types';

/** Whether moving an Order to `status` notifies its Customer. */
export function isNotifiedOrderStatus(status: OrderStatus): status is NotifiedOrderStatus {
  return (NOTIFIED_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}
