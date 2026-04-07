import { InventoryUpdateBodySchema } from "@backend/features/administration/domain/types";
import {
  CustomerGroupSchema,
  QuantitySchema,
  UomCodeSchema,
} from "@backend/features/core/domain/types/common";
import { VariantSnapshotSchema } from "@features/order/domain/value-objects";
import z from "zod";

export const AddCartItemSchema = z.object({
  productId: InventoryUpdateBodySchema,
  quantity: QuantitySchema.min(1, "Quantity must be at least 1"),
  variantKey: z.string().min(1).optional(),
  variant: VariantSnapshotSchema.optional(),
  uomCode: UomCodeSchema.optional().default("pcs"),
  customerGroup: CustomerGroupSchema.optional().default("public_b2c"),
});

export type AddCartItem = z.infer<typeof AddCartItemSchema>;
