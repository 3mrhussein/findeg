import { z } from 'zod';
import { OrderStatusSchema } from '@findeg/db/types';
export {
  ShippingAddressSchema,
  VariantSnapshotSchema,
  OrderStatusSchema,
  PaymentStatusSchema,
} from '@findeg/db/types';
export type {
  ShippingAddress,
  VariantSnapshot,
  OrderStatus,
  PaymentStatus,
} from '@findeg/db/types';
export * from './order-status-transitions';
export * from './order-payment-status-transitions';
export const OrderStatusUpdateSchema = z.object({
  status: OrderStatusSchema,
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
});
export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
