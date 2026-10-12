import { DomainError } from '../common';

export type InventoryErrorCode = 'INVALID_QUANTITY' | 'RESERVATION_ALREADY_SETTLED';

/** A stock request or Stock Reservation change that breaks an inventory rule. */
export class InventoryError extends DomainError<InventoryErrorCode> {
  constructor(code: InventoryErrorCode, message: string) {
    super(code, message);
  }
}
