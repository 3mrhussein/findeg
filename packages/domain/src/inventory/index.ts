/** Stock vocabulary (GLOSSARY: Stock Reservation; ADR-0005). */
import type { ActiveStatus, Id } from '../common';
import type { VariantId } from '../catalog';
import type { OrderId } from '../orders';

export { LOW_STOCK_MAX_UNITS, STOCK_LEVELS, availableStock, stockLevel } from './availability';
export type { StockLevel } from './availability';
export { InventoryError } from './inventory-error';
export type { InventoryErrorCode } from './inventory-error';
export { RESERVATION_STATES, reservationSettlement, reservationState } from './reservation';
export type { ReservationSettlement, ReservationState } from './reservation';
export { InsufficientStockError, allocateStock } from './allocation';
export type { StockAllocation, StockLine, StockShortfall } from './allocation';

export type WarehouseId = Id<'Warehouse'>;

/** Units held for an accepted Order at one warehouse. */
export interface StockReservation {
  orderId: OrderId;
  variantId: VariantId;
  warehouseId: WarehouseId;
  quantity: number;
}

/** A physical location that holds stock for variants. Only active warehouses are sold from. */
export interface Warehouse {
  id: WarehouseId;
  name: string;
  status: ActiveStatus;
}

/**
 * The stock of one variant at one warehouse: the units physically there (`onHand`) and how
 * many of them are held by Stock Reservations (`reserved`). Both are whole numbers.
 */
export interface StockBalance {
  variantId: VariantId;
  warehouseId: WarehouseId;
  onHand: number;
  reserved: number;
}
