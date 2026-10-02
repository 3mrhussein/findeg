import { z } from 'zod';
import { ShippingAddressSchema, type ShippingAddress } from '@findeg/db/types';

export { ShippingAddressSchema, type ShippingAddress };

export const CheckoutLineSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
});

export type CheckoutLine = z.infer<typeof CheckoutLineSchema>;

export const CheckoutValidateSchema = z.object({
  source: z.literal('cart'),
  lines: z.array(CheckoutLineSchema).min(1, 'At least one line is required'),
  address: ShippingAddressSchema.optional(),
  paymentMethod: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

export type CheckoutValidateInput = z.infer<typeof CheckoutValidateSchema>;

export const CheckoutOrderSchema = z
  .object({
    source: z.literal('cart'),
    lines: z.array(CheckoutLineSchema).min(1, 'At least one line is required'),
    confirmation: z.string().min(1, 'Confirmation digest is required'),
    paymentMethod: z.literal('cod'),
    address: ShippingAddressSchema,
    guestEmail: z.string().email().optional(),
    userId: z.number().int().positive().optional(),
  })
  .refine((data) => Boolean(data.userId || data.guestEmail), {
    message: 'Either userId or guestEmail must be provided',
    path: ['guestEmail'],
  });

export type CheckoutOrderInput = z.infer<typeof CheckoutOrderSchema>;

export interface CheckoutQuoteLine {
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

export interface CheckoutAcceptedOrder {
  id: number;
  orderReference: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  currency: string;
}
