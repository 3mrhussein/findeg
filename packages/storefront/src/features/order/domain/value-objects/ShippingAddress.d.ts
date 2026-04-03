/**
 * Shipping Address — Egyptian address format.
 *
 * Stored as JSONB in orders to preserve the exact address at time of purchase.
 */
import { z } from "zod";
export declare const ShippingAddressSchema: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodString;
    city: z.ZodString;
    area: z.ZodString;
    street: z.ZodString;
    building: z.ZodOptional<z.ZodString>;
    floor: z.ZodOptional<z.ZodString>;
    apartment: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
