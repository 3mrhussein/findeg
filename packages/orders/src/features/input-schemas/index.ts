/**
 * Client-safe input schemas for Order commands and the Staff portal. Pure: depends only on zod
 * and the Domain, so importing it never loads database configuration.
 */
export {
  orderStatusSchema as OrderStatusSchema,
  paymentStatusSchema as PaymentStatusSchema,
  orderStatusUpdateSchema as OrderStatusUpdateSchema,
} from './helpers';
export {
  StoredShippingAddressSchema as ShippingAddressSchema,
  VariantSnapshotSchema,
} from '@findeg/db/types';
export type { OrderStatusUpdate } from './helpers';
export type { OrderStatus, PaymentStatus, ShippingAddress, VariantSnapshot } from './types';
