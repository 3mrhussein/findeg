import { DomainError } from '../common';
import type { InventoryErrorCode } from './types';

/** A stock request or Stock Reservation change that breaks an inventory rule. */
export class InventoryError extends DomainError<InventoryErrorCode> {}
