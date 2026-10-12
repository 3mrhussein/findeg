export * from './locale';
export * from './governorates';
export * from './active-status';
export type { Id } from './identity';
export type { RandomBytes } from './random';
export {
  MoneyError,
  ZERO_MONEY,
  addMoney,
  compareMoney,
  money,
  moneyFromDecimal,
  moneyToDecimal,
  multiplyMoney,
  subtractMoney,
  sumMoney,
} from './money';
export type { Money, MoneyErrorCode } from './money';
export { DomainError } from './domain-error';
/** FindEg prices in Egyptian pounds. */
export const DEFAULT_CURRENCY = 'EGP' as const;
export type CurrencyCode = typeof DEFAULT_CURRENCY;
