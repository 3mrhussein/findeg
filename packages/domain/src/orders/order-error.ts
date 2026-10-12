import { DomainError } from '../common';

export type OrderErrorCode =
  | 'INVALID_ORDER_STATUS_TRANSITION'
  | 'SHIPPED_CANCELLATION_NEEDS_PARCEL_BACK'
  | 'INVALID_PAYMENT_STATUS_TRANSITION'
  | 'PAID_BEFORE_DELIVERY'
  | 'PAYMENT_REFUND_NEEDS_ORDER_REFUND'
  | 'REFUND_NEEDS_PAID_ORDER';

/** An Order, or a request to make or change one, that breaks an Order rule. */
export class OrderError extends DomainError<OrderErrorCode> {
  constructor(code: OrderErrorCode, message: string) {
    super(code, message);
  }
}
