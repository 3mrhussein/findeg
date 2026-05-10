import { z } from 'zod';
import { IdSchema, QuantitySchema } from '../../../core/domain/types/common';

/**
 * Inventory Update schema — now operates at the variant (SKU) level.
 *
 * Changes:
 * - productId → variantId
 * - Added warehouseId, movementType, notes for audit trail
 */
export const InventoryUpdateSchema = z.object({
  /** The specific variant (SKU) to update */
  variantId: IdSchema,

  /** Which warehouse. Defaults to primary warehouse if omitted. */
  warehouseId: IdSchema.optional(),

  /** New stock quantity (for absolute set) */
  quantity: QuantitySchema,

  /** Low-stock warning threshold */
  lowStockThreshold: QuantitySchema.optional(),

  /** Type of stock movement for audit */
  movementType: z.enum(['receipt', 'adjustment', 'return']).optional(),

  /** Admin notes explaining the change */
  notes: z.string().optional(),
});

/** Body schema for API routes (variantId comes from URL params) */
export const InventoryUpdateBodySchema = z.object({
  warehouseId: IdSchema.optional(),
  quantity: QuantitySchema,
  lowStockThreshold: QuantitySchema.optional(),
  movementType: z.enum(['receipt', 'adjustment', 'return']).optional(),
  notes: z.string().optional(),
});

export type InventoryUpdate = z.infer<typeof InventoryUpdateSchema>;
