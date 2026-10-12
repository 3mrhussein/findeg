import { z } from 'zod';
import { EGYPTIAN_MOBILE_PATTERN } from '@findeg/domain';
import type { OrderStatus, PaymentStatus } from '@findeg/domain';

/**
 * Sales & Order Primitives for Database Layer
 */

/** Legacy stored address fields; domain ShippingAddress is mapped at acceptance. */

export const StoredShippingAddressSchema = z.object({
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

export type StoredShippingAddress = z.infer<typeof StoredShippingAddressSchema>;

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
