/**
 * Checkout validation request body schema.
 */

import { z } from 'zod';
import { ShippingAddressSchema } from '../value-objects';
import { PaymentMethodSchema } from '@findeg/db/types';

export const CheckoutValidateSchema = z.object({
  address: ShippingAddressSchema,
  paymentMethod: PaymentMethodSchema,
});

export type CheckoutValidate = z.infer<typeof CheckoutValidateSchema>;
