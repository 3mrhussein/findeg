import { z } from 'zod';
import { IdSchema, QuantitySchema } from '../../../core/domain/types/common';

export const InventoryUpdateSchema = z.object({
  variantId: IdSchema,
  warehouseId: IdSchema.optional(),
  quantity: QuantitySchema,
  movementType: z.enum(['receipt', 'adjustment', 'return']).optional(),
  notes: z.string().optional(),
});

export const InventoryUpdateBodySchema = z.object({
  warehouseId: IdSchema.optional(),
  quantity: QuantitySchema,
  movementType: z.enum(['receipt', 'adjustment', 'return']).optional(),
  notes: z.string().optional(),
});

export type InventoryUpdate = z.infer<typeof InventoryUpdateSchema>;
