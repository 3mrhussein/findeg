import type { z } from 'zod';
import type { CurrencyCode } from '@findeg/domain';
import type { CheckoutReceipt } from '@findeg/db/types';
import type {
  CheckoutLineSchema as checkoutLineSchema,
  CheckoutOrderSchema as checkoutOrderSchema,
  CheckoutShippingAddressSchema as checkoutShippingAddressSchema,
  CheckoutValidateSchema as checkoutValidateSchema,
  ListCheckoutLineSchema as listCheckoutLineSchema,
} from './helpers';

export type CheckoutLine = z.infer<typeof checkoutLineSchema>;
export type ListCheckoutLine = z.infer<typeof listCheckoutLineSchema>;
export type CheckoutShippingAddress = z.infer<typeof checkoutShippingAddressSchema>;
export type CheckoutValidateInput = z.infer<typeof checkoutValidateSchema>;
export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;

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
export type { CheckoutReceipt };
