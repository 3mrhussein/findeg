import type { ReservationSettlement } from '../../../inventory';
import type { Order } from '../../types';
import * as constants from './constants';

export type OrderStatus = (typeof constants.ORDER_STATUSES)[number];
export type PaymentStatus = (typeof constants.PAYMENT_STATUSES)[number];

/** Where an Order stands: its status and its payment status. */
export type OrderProgress = Pick<Order, 'status' | 'paymentStatus'>;

/** The outcome of a status change: the new statuses, whether anything changed, and the stock effect. */
export interface OrderProgressChange extends OrderProgress {
  changed: boolean;
  /** How the Stock Reservation is settled by this change, if at all (ADR-0005). */
  stockSettlement: ReservationSettlement | null;
}

/** Facts Staff assert when they change an Order's status. */
export interface OrderStatusAssertions {
  /** The parcel of a shipped Order is back in the warehouse, so it can be cancelled (ADR-0005). */
  parcelBackInWarehouse?: boolean;
}
