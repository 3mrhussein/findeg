import type { OrderStatus, PaymentStatus } from '../core';

export class OrderNotFoundError extends Error {
  constructor(readonly orderId: number) {
    super(`Order #${orderId} not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidOrderStatusValueError extends Error {
  constructor(
    readonly field: 'status' | 'paymentStatus',
    readonly value: unknown,
  ) {
    super(`Unknown ${field}: ${String(value)}`);
    this.name = 'InvalidOrderStatusValueError';
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(
    readonly from: OrderStatus,
    readonly to: OrderStatus,
    readonly allowedTargets: OrderStatus[],
  ) {
    super(
      `Invalid status transition from ${from} to ${to}. Allowed: ${allowedTargets.join(', ') || 'none'}.`,
    );
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

export class InvalidPaymentStatusTransitionError extends Error {
  constructor(
    readonly from: PaymentStatus,
    readonly to: PaymentStatus,
    readonly allowedTargets: PaymentStatus[],
  ) {
    super(
      `Invalid payment status transition from ${from} to ${to}. Allowed: ${allowedTargets.join(', ') || 'none'}.`,
    );
    this.name = 'InvalidPaymentStatusTransitionError';
  }
}
