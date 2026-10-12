export * from './locale';
export * from './governorates';
export type { Id } from './identity';
export { MoneyError, money, moneyFromDecimal, moneyToDecimal } from './money';
export type { Money, MoneyErrorCode } from './money';
export { DomainError } from './domain-error';

/** FindEg prices in Egyptian pounds. */
export const DEFAULT_CURRENCY = 'EGP' as const;
export type CurrencyCode = typeof DEFAULT_CURRENCY;
