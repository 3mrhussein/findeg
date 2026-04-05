/**
 * OrderDetailControls — shared types & interfaces
 */

export interface OrderDetailControlsProps {
  orderId: number | string;
  initialStatus: string;
  initialPaymentStatus?: string;
  initialTrackingNumber?: string;
  initialAdminNotes?: string;
}
