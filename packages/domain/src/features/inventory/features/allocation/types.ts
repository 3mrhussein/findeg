import type { VariantId } from '../../../catalog';
import type { StockReservation } from '../../types';

/** Units of one variant an Order needs. */
export interface StockLine {
  variantId: VariantId;
  quantity: number;
}

/** Units of one variant to hold at one warehouse: a Stock Reservation before it names its Order. */
export type StockAllocation = Omit<StockReservation, 'orderId'>;

/** A variant an Order needs more of than is available. */
export interface StockShortfall {
  variantId: VariantId;
  requested: number;
  available: number;
}
