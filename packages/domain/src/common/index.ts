export * from './locale';
export * from './governorates';
export type { Id } from './identity';
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
export { BUSINESS_TIME_ZONE, businessDateOf, businessMonthOf } from './business-time';

/** FindEg prices in Egyptian pounds. */
export const DEFAULT_CURRENCY = 'EGP' as const;
export type CurrencyCode = typeof DEFAULT_CURRENCY;
