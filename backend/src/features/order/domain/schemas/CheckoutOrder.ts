/**
 * Checkout order request body schema.
 * Used by API routes for validating checkout/order creation requests.
 */

import { z } from "zod";
import { ShippingAddressSchema } from "../value-objects";
import { EmailSchema } from "@backend/features/core/domain/types/common";
import { PaymentMethodSchema } from "@backend/features/core/domain/types/common";

export const CheckoutOrderSchema = z.object({
  address: ShippingAddressSchema,
  paymentMethod: PaymentMethodSchema,
  guestEmail: EmailSchema.optional(),
});

export type CheckoutOrder = z.infer<typeof CheckoutOrderSchema>;
