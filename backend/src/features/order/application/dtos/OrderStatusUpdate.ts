import { z } from 'zod';
import { OrderStatusSchema } from '../../../core/schemas';

export const OrderStatusUpdateSchema = z.object({
  status: OrderStatusSchema,
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
});

export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
