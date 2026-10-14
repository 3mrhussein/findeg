import { z } from 'zod';
import { IdSchema as idSchema, QuantitySchema as quantitySchema } from '@findeg/db/types';

const inventoryUpdateSchema = z.object({
  variantId: idSchema,
  warehouseId: idSchema.optional(),
  quantity: quantitySchema,
  movementType: z.enum(['receipt', 'adjustment', 'return']).optional(),
  notes: z.string().optional(),
});

const inventoryUpdateBodySchema = z.object({
  warehouseId: idSchema.optional(),
  quantity: quantitySchema,
  movementType: z.enum(['receipt', 'adjustment', 'return']).optional(),
  notes: z.string().optional(),
});

export type InventoryUpdate = z.infer<typeof inventoryUpdateSchema>;

export {
  inventoryUpdateSchema as InventoryUpdateSchema,
  inventoryUpdateBodySchema as InventoryUpdateBodySchema,
};
