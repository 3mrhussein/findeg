export * from './locale';
export * from './governorates';
export type { Id } from './identity';
export type { Money } from './money';

/** FindEg prices in Egyptian pounds. */
export const DEFAULT_CURRENCY = 'EGP' as const;
export type CurrencyCode = typeof DEFAULT_CURRENCY;
