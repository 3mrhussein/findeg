/**
 * Shipping Address — Egyptian address format.
 *
 * Stored as JSONB in orders to preserve the exact address at time of purchase.
 */

import { z } from "zod";

/** Egyptian mobile: 01[0125] + 8 digits (e.g. 01012345678) or +20 prefix */
const EgyptianPhoneRegex = /^(\+20)?01[0125]\d{8}$/;

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .min(11, "Valid phone number required")
    .regex(EgyptianPhoneRegex, "Valid Egyptian mobile number (e.g. 01012345678)"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  street: z.string().min(2, "Street is required"),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  notes: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
