/** Stock Reservation (GLOSSARY: Stock Reservation): units held for an accepted Order at one warehouse. */
export interface StockReservation {
  orderId: number;
  variantId: number;
  warehouseId: number;
  quantity: number;
}
