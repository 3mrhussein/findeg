import type { NotifiedOrderStatus } from '@findeg/domain/orders';

export type { NotifiedOrderStatus };

export interface OrderStatusPayload {
  orderId: number;
  status: NotifiedOrderStatus;
}
