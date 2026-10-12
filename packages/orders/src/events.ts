export const ORDER_STATUS_KIND = 'order-status';

import type { NotifiedOrderStatus } from '@findeg/domain/orders';
export type { NotifiedOrderStatus } from '@findeg/domain/orders';

/** Row id for a status email: one per Order Reference and status. */
export const orderStatusId = (orderReference: string, status: NotifiedOrderStatus) =>
  `${ORDER_STATUS_KIND}:${orderReference}:${status}`;

export interface OrderStatusPayload {
  orderId: number;
  status: NotifiedOrderStatus;
}
