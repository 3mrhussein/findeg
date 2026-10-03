import { z } from 'zod';
import {
  ShippingAddressSchema,
  type CheckoutReceipt,
  type ShippingAddress,
} from '@findeg/db/types';

export { ShippingAddressSchema, type CheckoutReceipt, type ShippingAddress };

export const CheckoutLineSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
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
    guestEmail: z.string().email().optional(),
  }),
);

export type CheckoutValidateInput = z.infer<typeof CheckoutValidateSchema>;

export const CheckoutOrderSchema = CheckoutSourceSchema.and(
  z.object({
    confirmation: z.string().min(1, 'Confirmation digest is required'),
    paymentMethod: z.literal('cod'),
    deliveryMethod: z.string().optional(),
    address: ShippingAddressSchema,
    guestEmail: z.string().email().optional(),
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
  unitPrice: number;
  discounts: Array<{ source: string; amount: number }>;
  lineTotal: number;
}

export interface CheckoutQuote {
  lines: CheckoutQuoteLine[];
  shipping: number;
  subtotal: number;
  total: number;
  currency: 'EGP';
  confirmation: string;
}

export type CheckoutAcceptedOrder = CheckoutReceipt['order'];
