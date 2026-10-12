import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@findeg/domain/orders';
export const OrderStatusSchema = z.enum(ORDER_STATUSES);
export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);
export { ShippingAddressSchema, VariantSnapshotSchema } from '@findeg/db/types';
export type { ShippingAddress, VariantSnapshot } from '@findeg/db/types';
export type { OrderStatus, PaymentStatus } from '@findeg/domain/orders';
export const OrderStatusUpdateSchema = z.object({
  status: OrderStatusSchema,
  parcelBackInWarehouse: z.boolean().optional(),
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
});
export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
