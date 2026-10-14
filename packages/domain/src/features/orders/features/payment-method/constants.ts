import type { PaymentMethodType, PaymentOption } from './types';

/**
 * Payment methods are data, not a fixed list: a method is accepted at checkout when its option
 * is `allowed`. Turning card on is a data change, plus a database enum migration (ADR-0005).
 */
export const PAYMENT_METHOD_TYPES = ['cod', 'card'] as const;

export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { type: 'cod', allowed: true },
  { type: 'card', allowed: false },
];

/** Payment methods a checkout may accept today. */
export const ACCEPTED_PAYMENT_TYPES: readonly PaymentMethodType[] = PAYMENT_OPTIONS.filter(
  (option) => option.allowed,
).map((option) => option.type);
