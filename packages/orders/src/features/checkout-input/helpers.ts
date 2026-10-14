import { z } from 'zod';
import {
  ACCEPTED_PAYMENT_TYPES,
  GOVERNORATES,
  LINE_QUANTITY_MAX,
  LINE_QUANTITY_MIN,
} from '@findeg/domain';
import { StoredShippingAddressSchema } from '@findeg/db/types';

export const CheckoutShippingAddressSchema = StoredShippingAddressSchema.extend({
  // Legacy city-only input must name a governorate; explicit governorate supports towns.
  governorate: z.enum(GOVERNORATES).optional(),
});

export const CheckoutLineSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(LINE_QUANTITY_MIN).max(LINE_QUANTITY_MAX),
});

export const ListCheckoutLineSchema = z.object({
  listItemId: z.number(),
  variantId: z.number(),
  quantity: z.number(),
});

const CheckoutSourceSchema = z.discriminatedUnion('source', [
  z.object({
    source: z.literal('cart'),
    lines: z.array(CheckoutLineSchema).min(1, 'At least one line is required'),
  }),
  z.object({
    source: z.literal('list'),
    publicCode: z.string().min(1),
    // List-specific range, membership and duplicate failures are reported as
    // 422 selection-invalid by the checkout service with their list item IDs.
    lines: z.array(ListCheckoutLineSchema),
  }),
]);

export const CheckoutValidateSchema = CheckoutSourceSchema.and(
  z.object({
    address: CheckoutShippingAddressSchema.optional(),
    paymentMethod: z.string().optional(),
    guestEmail: z.string().trim().toLowerCase().pipe(z.email().max(255)).optional(),
  }),
);

export const CheckoutOrderSchema = CheckoutSourceSchema.and(
  z.object({
    confirmation: z.string().min(1, 'Confirmation digest is required'),
    paymentMethod: z.enum(ACCEPTED_PAYMENT_TYPES),
    deliveryMethod: z.string().optional(),
    address: CheckoutShippingAddressSchema,
    guestEmail: z.string().trim().toLowerCase().pipe(z.email().max(255)).optional(),
  }),
);
