/**
 * Add item to cart request body schema.
 */

import { z } from 'zod';
import { CART_QUANTITY_MIN, CART_QUANTITY_MAX } from '@findeg/domain/orders';
import { IdSchema, QuantitySchema } from '@findeg/backend/features/core/domain/types/common';
import { VariantSnapshotSchema } from '@findeg/orders/schemas';

export const AddCartItemSchema = z.object({
  productId: IdSchema,
  quantity: QuantitySchema.min(CART_QUANTITY_MIN).max(CART_QUANTITY_MAX),
  variantKey: z.string().min(1).optional(),
  variant: VariantSnapshotSchema.optional(),
});

export type AddCartItem = z.infer<typeof AddCartItemSchema>;
