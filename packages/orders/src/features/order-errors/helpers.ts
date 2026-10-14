import {
  OrderError,
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUS_TRANSITIONS,
  type OrderProgress,
  type OrderStatus,
  type PaymentStatus,
} from '@findeg/domain/orders';

export class OrderNotFoundError extends Error {
  constructor(readonly orderId: number) {
    super(`Order #${String(orderId)} not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(
    readonly from: OrderStatus,
    readonly to: OrderStatus,
    readonly allowedTargets: OrderStatus[],
    message?: string,
  ) {
    const allowedList = allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none';
    super(message ?? `Invalid status transition from ${from} to ${to}. Allowed: ${allowedList}.`);
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

export class InvalidPaymentStatusTransitionError extends Error {
  constructor(
    readonly from: PaymentStatus,
    readonly to: PaymentStatus,
    readonly allowedTargets: PaymentStatus[],
    message?: string,
  ) {
    const allowedList = allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none';
    super(
      message ??
        `Invalid payment status transition from ${from} to ${to}. Allowed: ${allowedList}.`,
    );
    this.name = 'InvalidPaymentStatusTransitionError';
  }
}

/** Preserve the feature's application errors while the Domain owns the rules. */
export function mapOrderRuleError(
  error: unknown,
  order: OrderProgress,
  status?: OrderStatus,
  paymentStatus?: PaymentStatus,
): unknown {
  if (!(error instanceof OrderError)) return error;
  if (status !== undefined)
    return new InvalidOrderStatusTransitionError(
      order.status,
      status,
      [...ORDER_STATUS_TRANSITIONS[order.status]],
      error.message,
    );
  if (paymentStatus !== undefined)
    return new InvalidPaymentStatusTransitionError(
      order.paymentStatus,
      paymentStatus,
      [...PAYMENT_STATUS_TRANSITIONS[order.paymentStatus]],
      error.message,
    );
  return error;
}
