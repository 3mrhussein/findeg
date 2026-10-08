/**
 * Checkout validation request body schema.
 */

import { z } from 'zod';
import { ShippingAddressSchema } from '../value-objects';
import { PaymentMethodSchema } from '@findeg/backend/features/core/schemas';

export const CheckoutValidateSchema = z.object({
  address: ShippingAddressSchema,
  paymentMethod: PaymentMethodSchema,
});

export type CheckoutValidate = z.infer<typeof CheckoutValidateSchema>;
