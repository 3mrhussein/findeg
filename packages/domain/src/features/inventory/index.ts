/** Stock vocabulary (GLOSSARY: Stock Reservation; ADR-0005). */
export { InventoryError } from './helpers';
export type {
  InventoryErrorCode,
  StockBalance,
  StockReservation,
  Warehouse,
  WarehouseId,
} from './types';
export {
  LOW_STOCK_MAX_UNITS,
  STOCK_LEVELS,
  availableStock,
  freeUnits,
  stockLevel,
} from './features/availability';
export type { StockLevel } from './features/availability';
export {
  RESERVATION_STATES,
  reservationSettlement,
  reservationState,
} from './features/reservation';
export type { ReservationSettlement, ReservationState } from './features/reservation';
export { InsufficientStockError, allocateStock } from './features/allocation';
export type { StockAllocation, StockLine, StockShortfall } from './features/allocation';
