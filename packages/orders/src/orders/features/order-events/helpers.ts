import { ORDER_STATUS_KIND } from './constants';
import type { NotifiedOrderStatus } from './types';

/** Row id for a status email: one per Order Reference and status. */
export const orderStatusId = (orderReference: string, status: NotifiedOrderStatus) =>
  `${ORDER_STATUS_KIND}:${orderReference}:${status}`;
