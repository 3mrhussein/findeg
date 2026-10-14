/**
 * The pure Order-status message protocol consumed by Backend Outbox. Row identity and the
 * customer-facing notified statuses are the Domain's; delivery stays in Backend.
 */
export { ORDER_STATUS_KIND } from './constants';
export { orderStatusId } from './helpers';
export type { NotifiedOrderStatus, OrderStatusPayload } from './types';
