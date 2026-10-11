/**
 * OrderDetailControls — shared types & interfaces
 */

import type { OrderStatus, PaymentStatus } from '@findeg/orders/schemas';

export interface OrderDetailControlsProps {
  orderId: number | string;
  initialStatus: OrderStatus;
  initialPaymentStatus: PaymentStatus;
  initialTrackingNumber?: string;
  initialAdminNotes?: string;
}
