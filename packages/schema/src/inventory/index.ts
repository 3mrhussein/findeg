/** Stock Reservation (GLOSSARY: Stock Reservation): units held for an accepted Order at one warehouse. */
export interface StockReservation {
  orderId: number;
  variantId: number;
  warehouseId: number;
  quantity: number;
}

/** A physical location that holds stock for variants. */
export interface Warehouse {
  id: number;
  name: string;
}
