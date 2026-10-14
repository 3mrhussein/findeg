import type { ActiveStatus, Id } from '../common';
import type { VariantId } from '../catalog';
import type { OrderId } from '../orders';

export type WarehouseId = Id<'Warehouse'>;

export type InventoryErrorCode = 'INVALID_QUANTITY' | 'RESERVATION_ALREADY_SETTLED';

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
