/**
 * Variant Snapshot — Preserves selected variant details at time of purchase.
 *
 * Structured shape with passthrough for backward compatibility.
 */

import { z } from "zod";

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
  .passthrough(); // Allow extra fields for legacy data

export type VariantSnapshot = z.infer<typeof VariantSnapshotSchema>;
