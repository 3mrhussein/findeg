/**
 * Payment methods are data, not a fixed list: a method is accepted at checkout when its option
 * is `allowed`. Turning card on is a data change, plus a database enum migration (ADR-0005).
 */
export const PAYMENT_METHOD_TYPES = ['cod', 'card'] as const;
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

/** A payment method and whether it is accepted today. */
export interface PaymentOption {
  type: PaymentMethodType;
  allowed: boolean;
}

export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { type: 'cod', allowed: true },
  { type: 'card', allowed: false },
];

/** Payment methods a checkout may accept today. */
export const ACCEPTED_PAYMENT_TYPES: readonly PaymentMethodType[] = PAYMENT_OPTIONS.filter(
  (option) => option.allowed,
).map((option) => option.type);

export type PaymentMethod = PaymentMethodType;
