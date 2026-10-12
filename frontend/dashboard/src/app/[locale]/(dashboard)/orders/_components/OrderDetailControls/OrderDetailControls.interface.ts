/**
 * OrderDetailControls — shared types & interfaces
 */

import type { OrderStatus, PaymentStatus } from '@findeg/domain/orders';

export interface OrderDetailControlsProps {
  orderId: number | string;
  initialStatus: OrderStatus;
  initialPaymentStatus: PaymentStatus;
  initialTrackingNumber?: string;
  initialAdminNotes?: string;
}
