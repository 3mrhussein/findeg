import type { OrderStatus, PaymentStatus } from '@findeg/domain/types';

export interface OrderStatusTransitionResult {
  changed: boolean;
  previousStatus: OrderStatus;
  status: OrderStatus;
}

export interface PaymentStatusTransitionResult {
  changed: boolean;
  previousStatus: PaymentStatus;
  status: PaymentStatus;
}
