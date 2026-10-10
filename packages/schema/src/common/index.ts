/** Languages FindEg publishes in. Arabic is a first-class locale, not a translation fallback. */
export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Text shown in each supported locale. */
export interface LocalizedText {
  en: string;
  ar?: string;
}

/** FindEg prices in Egyptian pounds. Money is exact integer piasters (ADR-0007). */
export const DEFAULT_CURRENCY = 'EGP' as const;
export type CurrencyCode = typeof DEFAULT_CURRENCY;
export const PIASTERS_PER_POUND = 100;

/** A non-negative amount of one currency, in its smallest unit. */
export interface MoneyInPiasters {
  amount: bigint;
  currency: CurrencyCode;
}
