/**
 * Add item to cart request body schema.
 */

import { z } from 'zod';
import {
  CustomerGroupSchema,
  IdSchema,
  QuantitySchema,
  UomCodeSchema,
} from '@findeg/backend/features/core/domain/types/common';
import { VariantSnapshotSchema } from '@findeg/backend/features/order/domain/value-objects';

export const AddCartItemSchema = z.object({
  productId: IdSchema,
  quantity: QuantitySchema.min(1, 'Quantity must be at least 1'),
  variantKey: z.string().min(1).optional(),
  variant: VariantSnapshotSchema.optional(),
  uomCode: UomCodeSchema.optional().default('pcs'),
  customerGroup: CustomerGroupSchema.optional().default('public_b2c'),
});

export type AddCartItem = z.infer<typeof AddCartItemSchema>;
