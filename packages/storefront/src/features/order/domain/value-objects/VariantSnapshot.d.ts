/**
 * Variant Snapshot — Preserves selected variant details at time of purchase.
 *
 * Structured shape with passthrough for backward compatibility.
 */
import { z } from "zod";
export declare const VariantSnapshotSchema: z.ZodObject<{
    variantId: z.ZodOptional<z.ZodNumber>;
    variantKey: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$loose>;
export type VariantSnapshot = z.infer<typeof VariantSnapshotSchema>;
