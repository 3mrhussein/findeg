import { z } from "zod";
import { IdSchema, QuantitySchema } from "@/features/core/domain/types/common";

export const InventoryUpdateSchema = z.object({
  productId: IdSchema,
  quantity: QuantitySchema,
  lowStockThreshold: QuantitySchema.optional(),
});

/** Body schema for API routes (productId comes from URL params) */
export const InventoryUpdateBodySchema = z.object({
  quantity: QuantitySchema,
  lowStockThreshold: QuantitySchema.optional(),
});

export type InventoryUpdate = z.infer<typeof InventoryUpdateSchema>;
