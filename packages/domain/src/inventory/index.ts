/** Stock vocabulary (GLOSSARY: Stock Reservation). */
import type { Id } from '../common';
import type { VariantId } from '../catalog';
import type { OrderId } from '../orders';

export type WarehouseId = Id<'Warehouse'>;

/** Units held for an accepted Order at one warehouse. */
export interface StockReservation {
  orderId: OrderId;
  variantId: VariantId;
  warehouseId: WarehouseId;
  quantity: number;
}

/** A physical location that holds stock for variants. */
export interface Warehouse {
  id: WarehouseId;
  name: string;
}
