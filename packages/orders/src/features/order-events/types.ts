import type { NotifiedOrderStatus } from '@findeg/domain/types';

export type { NotifiedOrderStatus };

export interface OrderStatusPayload {
  orderId: number;
  status: NotifiedOrderStatus;
}
