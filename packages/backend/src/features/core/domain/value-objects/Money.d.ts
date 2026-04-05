import { z } from "zod";
/**
 * ISO 4217-like currency code.
 * Keep strict and uppercase to avoid ambiguous money handling.
 */
export declare const CurrencyCodeSchema: z.ZodString;
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
export declare const DEFAULT_CURRENCY: CurrencyCode;
export declare const MoneyAmountSchema: z.ZodNumber;
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;
/**
 * Rich money value-object for future multi-currency/domain-safe flows.
 */
export declare const MoneySchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type Money = z.infer<typeof MoneySchema>;
export declare function toMoney(amount: MoneyAmount, currency?: CurrencyCode): Money;
