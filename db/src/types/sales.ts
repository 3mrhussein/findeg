import { z } from 'zod';
import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES, PAYMENT_METHOD_VALUES } from './enum-values';

/**
 * Sales & Order Primitives for Database Layer
 */

// ─── Enum-derived Schemas ────────────────────────────────────────────────────

export const OrderStatusSchema = z.enum(ORDER_STATUS_VALUES);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentStatusSchema = z.enum(PAYMENT_STATUS_VALUES);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentMethodSchema = z.enum(PAYMENT_METHOD_VALUES);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/** Egyptian mobile: 01[0125] + 8 digits (e.g. 01012345678) or +20 prefix */
const EgyptianPhoneRegex = /^(\+20)?01[0125]\d{8}$/;

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z
    .string()
    .min(11, 'Valid phone number required')
    .regex(EgyptianPhoneRegex, 'Valid Egyptian mobile number (e.g. 01012345678)'),
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
