import { LOCALES, CART_QUANTITY_MIN, CART_QUANTITY_MAX } from '@findeg/domain';
/**
 * Storefront Input Validation Schemas
 *
 * Validates user inputs at the app data layer before calling backend services.
 * All mutations in src/data/{feature}/actions.ts use these schemas.
 */

import { z } from 'zod';

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UpdateProfileInputSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  phone: z.string().max(20, 'Phone must be at most 20 characters').trim().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

// ============================================================================
// CART SCHEMAS
// ============================================================================

export const AddToCartInputSchema = z.object({
  productId: z.number().int().positive('Product ID must be positive'),
  variantId: z.number().int().positive('Variant ID must be positive'),
  quantity: z
    .number()
    .int()
    .min(CART_QUANTITY_MIN, 'Quantity must be at least 1')
    .max(CART_QUANTITY_MAX, 'Quantity must be at most 999'),
  locale: z.enum([...LOCALES]).optional(),
});

export type AddToCartInput = z.infer<typeof AddToCartInputSchema>;

export const UpdateQuantityInputSchema = z.object({
  variantId: z.number().int().positive('Variant ID must be positive'),
  quantity: z
    .number()
    .int()
    .min(CART_QUANTITY_MIN, 'Quantity must be at least 1')
    .max(CART_QUANTITY_MAX, 'Quantity must be at most 999'),
});

export type UpdateQuantityInput = z.infer<typeof UpdateQuantityInputSchema>;

export const CartIdSchema = z.string().min(1, 'Cart ID is required');

export type CartId = z.infer<typeof CartIdSchema>;

// ============================================================================
// CATALOG SCHEMAS
// ============================================================================

export const LocaleSchema = z.enum([...LOCALES]).default('en');

export type Locale = z.infer<typeof LocaleSchema>;

export const ProductPricingInputSchema = z.object({
  productId: z.number().int().positive('Product ID must be positive'),
  variantId: z.number().int().positive('Variant ID must be positive'),
});

export type ProductPricingInput = z.infer<typeof ProductPricingInputSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates and returns data or throws a readable error
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}
