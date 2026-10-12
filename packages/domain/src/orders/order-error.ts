import { DomainError } from '../common';

export type OrderErrorCode =
  'INVALID_ORDER_STATUS_TRANSITION' | 'SHIPPED_CANCELLATION_NEEDS_PARCEL_BACK';

/** An Order, or a request to make or change one, that breaks an Order rule. */
export class OrderError extends DomainError<OrderErrorCode> {
  constructor(code: OrderErrorCode, message: string) {
    super(code, message);
  }
}
