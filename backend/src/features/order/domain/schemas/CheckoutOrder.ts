/**
 * Checkout order request body schema.
 * Used by API routes for validating checkout/order creation requests.
 */

import { z } from 'zod';
import { ShippingAddressSchema } from '../value-objects';
import { EmailSchema } from '@findeg/db/types';
import { PaymentMethodSchema } from '@findeg/db/types';

export const CheckoutOrderSchema = z.object({
  address: ShippingAddressSchema,
  paymentMethod: PaymentMethodSchema,
  guestEmail: EmailSchema.optional(),
});

export type CheckoutOrder = z.infer<typeof CheckoutOrderSchema>;
