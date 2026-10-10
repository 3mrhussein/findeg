/**
 * FindEg prices in Egyptian pounds (EGP). Money is exact integer piasters (ADR-0007):
 * 1 EGP = 100 piasters, and amounts never pass through floating point.
 */
export const DEFAULT_CURRENCY = 'EGP' as const;
export type CurrencyCode = typeof DEFAULT_CURRENCY;

export const PIASTERS_PER_POUND = 100;

/** A non-negative amount of one currency, in its smallest unit. */
export interface MoneyInPiasters {
  amount: bigint;
  currency: CurrencyCode;
}
