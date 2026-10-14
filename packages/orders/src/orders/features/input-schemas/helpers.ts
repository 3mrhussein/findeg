import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@findeg/domain/orders';

export const orderStatusSchema = z.enum(ORDER_STATUSES);
export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
  parcelBackInWarehouse: z.boolean().optional(),
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
});

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
