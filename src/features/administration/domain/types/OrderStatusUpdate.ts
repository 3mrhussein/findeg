/**
 * Input for updating order status
 */
export interface OrderStatusUpdate {
  status: string;
  trackingNumber?: string;
  adminNotes?: string;
}
