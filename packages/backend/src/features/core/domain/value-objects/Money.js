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
export const DEFAULT_CURRENCY = "EGP";
export const MoneyAmountSchema = z.number().finite().nonnegative();
/**
 * Rich money value-object for future multi-currency/domain-safe flows.
 */
export const MoneySchema = z.object({
    amount: MoneyAmountSchema,
    currency: CurrencyCodeSchema.default(DEFAULT_CURRENCY),
});
export function toMoney(amount, currency = DEFAULT_CURRENCY) {
    return { amount, currency };
}
