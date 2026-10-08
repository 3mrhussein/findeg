import type { OrderStatus, PaymentStatus } from '@findeg/db/types';
export class OrderNotFoundError extends Error {
  constructor(readonly orderId: number) {
    super(`Order #${orderId} not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(
    readonly from: OrderStatus,
    readonly to: OrderStatus,
    readonly allowedTargets: OrderStatus[],
  ) {
    const allowedList = allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none';
    super(`Invalid status transition from ${from} to ${to}. Allowed: ${allowedList}.`);
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

export interface OrderStatusTransitionResult {
  changed: boolean;
  previousStatus: OrderStatus;
  status: OrderStatus;
}

export class InvalidPaymentStatusTransitionError extends Error {
  constructor(
    readonly from: PaymentStatus,
    readonly to: PaymentStatus,
    readonly allowedTargets: PaymentStatus[],
  ) {
    const allowedList = allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none';
    super(`Invalid payment status transition from ${from} to ${to}. Allowed: ${allowedList}.`);
    this.name = 'InvalidPaymentStatusTransitionError';
  }
}

export interface PaymentStatusTransitionResult {
  changed: boolean;
  previousStatus: PaymentStatus;
  status: PaymentStatus;
}
