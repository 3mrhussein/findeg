import { z } from 'zod';

/**
 * Sales & Order Primitives for Database Layer
 */

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
  })
  .passthrough();

export type VariantSnapshot = z.infer<typeof VariantSnapshotSchema>;
