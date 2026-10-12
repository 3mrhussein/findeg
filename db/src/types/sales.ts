import { z } from 'zod';
import {
  EGYPTIAN_MOBILE_PATTERN,
  ORDER_STATUSES as ORDER_STATUS_VALUES,
  PAYMENT_STATUSES as PAYMENT_STATUS_VALUES,
  PAYMENT_METHOD_TYPES as PAYMENT_METHOD_VALUES,
} from '@findeg/domain';
import type { OrderStatus, PaymentStatus } from '@findeg/domain';

/**
 * Sales & Order Primitives for Database Layer
 */

// ─── Enum-derived Schemas ────────────────────────────────────────────────────

export const OrderStatusSchema = z.enum(ORDER_STATUS_VALUES);

export const PaymentStatusSchema = z.enum(PAYMENT_STATUS_VALUES);

export const PaymentMethodSchema = z.enum(PAYMENT_METHOD_VALUES);

export type { OrderStatus, PaymentStatus, PaymentMethod } from '@findeg/domain';

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z
    .string()
    .min(11, 'Valid phone number required')
    .regex(EGYPTIAN_MOBILE_PATTERN, 'Valid Egyptian mobile number (e.g. 01012345678)'),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area is required'),
  street: z.string().min(2, 'Street is required'),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  notes: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const VariantSnapshotSchema = z
  .object({
    /** FK to the purchased variant — may be null for legacy orders */
    variantId: z.number().optional(),

    /** Human-readable variant key (e.g., "blue-0.7") */
    variantKey: z.string().optional(),

    /** SKU frozen at purchase time */
    sku: z.string().optional(),

    /** Display label at purchase time */
    label: z.string().optional(),

    /** Attribute key-value pairs at purchase time */
    attributes: z.record(z.string(), z.unknown()).optional(),

    /** Checkout writes the variant's localized label: `{ en, ar }`. */
    en: z.string().optional(),
    ar: z.string().optional(),
  })
  .passthrough();

export type VariantSnapshot = z.infer<typeof VariantSnapshotSchema>;

export interface CheckoutReceipt {
  order: {
    id: number;
    orderReference: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: string;
    currency: string;
  };
  message: string;
}
