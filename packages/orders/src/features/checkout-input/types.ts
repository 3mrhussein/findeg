import type { z } from 'zod';
import type { CurrencyCode } from '@findeg/domain';
import type { CheckoutReceipt } from '@findeg/db/types';
import type {
  CheckoutLineSchema,
  CheckoutOrderSchema,
  CheckoutShippingAddressSchema,
  CheckoutValidateSchema,
  ListCheckoutLineSchema,
} from './helpers';

export type CheckoutLine = z.infer<typeof CheckoutLineSchema>;
export type ListCheckoutLine = z.infer<typeof ListCheckoutLineSchema>;
export type CheckoutShippingAddress = z.infer<typeof CheckoutShippingAddressSchema>;
export type CheckoutValidateInput = z.infer<typeof CheckoutValidateSchema>;
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
export type { CheckoutReceipt };
