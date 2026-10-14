import { z } from 'zod';
import {
  LINE_QUANTITY_MIN,
  LINE_QUANTITY_MAX,
  GOVERNORATES,
  type CurrencyCode,
} from '@findeg/domain';
import { ACCEPTED_PAYMENT_TYPES } from '@findeg/domain';
import { StoredShippingAddressSchema, type CheckoutReceipt } from '@findeg/db/types';

export { type CheckoutReceipt };
export const ShippingAddressSchema = StoredShippingAddressSchema.extend({
  // Legacy city-only input must name a governorate; explicit governorate supports towns.
  governorate: z.enum(GOVERNORATES).optional(),
});
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const CheckoutLineSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(LINE_QUANTITY_MIN).max(LINE_QUANTITY_MAX),
});

export type CheckoutLine = z.infer<typeof CheckoutLineSchema>;

export const ListCheckoutLineSchema = z.object({
  listItemId: z.number(),
  variantId: z.number(),
  quantity: z.number(),
});

export type ListCheckoutLine = z.infer<typeof ListCheckoutLineSchema>;

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

export type CheckoutSourceInput = z.infer<typeof CheckoutSourceSchema>;

export const CheckoutValidateSchema = CheckoutSourceSchema.and(
  z.object({
    address: ShippingAddressSchema.optional(),
    paymentMethod: z.string().optional(),
    guestEmail: z.string().trim().toLowerCase().pipe(z.email().max(255)).optional(),
  }),
);

export type CheckoutValidateInput = z.infer<typeof CheckoutValidateSchema>;

export const CheckoutOrderSchema = CheckoutSourceSchema.and(
  z.object({
    confirmation: z.string().min(1, 'Confirmation digest is required'),
    paymentMethod: z.enum(ACCEPTED_PAYMENT_TYPES),
    deliveryMethod: z.string().optional(),
    address: ShippingAddressSchema,
    guestEmail: z.string().trim().toLowerCase().pipe(z.email().max(255)).optional(),
  }),
);

export type CheckoutOrderInput = z.infer<typeof CheckoutOrderSchema>;

export interface CheckoutOrderContext {
  userId?: number;
  guestId?: string;
  idempotencyKey?: string;
}

export interface CheckoutQuoteLine {
  listItemId?: number;
  variantId: number;
  quantity: number;
  unitPrice: string;
  discounts: Array<{ source: string; amount: string }>;
  lineTotal: string;
}

export interface CheckoutQuote {
  lines: CheckoutQuoteLine[];
  shipping: string;
  subtotal: string;
  total: string;
  currency: CurrencyCode;
  confirmation: string;
}

export type CheckoutAcceptedOrder = CheckoutReceipt['order'];
