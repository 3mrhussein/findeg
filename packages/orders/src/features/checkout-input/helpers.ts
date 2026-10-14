import { z } from 'zod';
import {
  ACCEPTED_PAYMENT_TYPES,
  GOVERNORATES,
  LINE_QUANTITY_MAX,
  LINE_QUANTITY_MIN,
} from '@findeg/domain';
import { StoredShippingAddressSchema as storedShippingAddressSchema } from '@findeg/db/types';

const checkoutShippingAddressSchema = storedShippingAddressSchema.extend({
  // Legacy city-only input must name a governorate; explicit governorate supports towns.
  governorate: z.enum(GOVERNORATES).optional(),
});

const checkoutLineSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(LINE_QUANTITY_MIN).max(LINE_QUANTITY_MAX),
});

const listCheckoutLineSchema = z.object({
  listItemId: z.number(),
  variantId: z.number(),
  quantity: z.number(),
});

const checkoutSourceSchema = z.discriminatedUnion('source', [
  z.object({
    source: z.literal('cart'),
    lines: z.array(checkoutLineSchema).min(1, 'At least one line is required'),
  }),
  z.object({
    source: z.literal('list'),
    publicCode: z.string().min(1),
    // List-specific range, membership and duplicate failures are reported as
    // 422 selection-invalid by the checkout service with their list item IDs.
    lines: z.array(listCheckoutLineSchema),
  }),
]);

const checkoutValidateSchema = checkoutSourceSchema.and(
  z.object({
    address: checkoutShippingAddressSchema.optional(),
    paymentMethod: z.string().optional(),
    guestEmail: z.string().trim().toLowerCase().pipe(z.email().max(255)).optional(),
  }),
);

const checkoutOrderSchema = checkoutSourceSchema.and(
  z.object({
    confirmation: z.string().min(1, 'Confirmation digest is required'),
    paymentMethod: z.enum(ACCEPTED_PAYMENT_TYPES),
    deliveryMethod: z.string().optional(),
    address: checkoutShippingAddressSchema,
    guestEmail: z.string().trim().toLowerCase().pipe(z.email().max(255)).optional(),
  }),
);

export {
  checkoutShippingAddressSchema as CheckoutShippingAddressSchema,
  checkoutLineSchema as CheckoutLineSchema,
  listCheckoutLineSchema as ListCheckoutLineSchema,
  checkoutValidateSchema as CheckoutValidateSchema,
  checkoutOrderSchema as CheckoutOrderSchema,
};
