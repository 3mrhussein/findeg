import { z } from "zod";

/**
 * ISO 4217-like currency code.
 * Keep strict and uppercase to avoid ambiguous money handling.
 */
export const CurrencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter code");

export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

export const DEFAULT_CURRENCY: CurrencyCode = "EGP";

export const MoneyAmountSchema = z.number().finite().nonnegative();
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;

/**
 * Rich money value-object for future multi-currency/domain-safe flows.
 */
export const MoneySchema = z.object({
  amount: MoneyAmountSchema,
  currency: CurrencyCodeSchema.default(DEFAULT_CURRENCY),
});

export type Money = z.infer<typeof MoneySchema>;

export function toMoney(amount: MoneyAmount, currency: CurrencyCode = DEFAULT_CURRENCY): Money {
  return { amount, currency };
}
