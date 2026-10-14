import * as constants from './constants';

export type PaymentMethodType = (typeof constants.PAYMENT_METHOD_TYPES)[number];

/** A payment method and whether it is accepted today. */
export interface PaymentOption {
  type: PaymentMethodType;
  allowed: boolean;
}

export type PaymentMethod = PaymentMethodType;
