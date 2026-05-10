import {
  CurrencyCodeSchema,
  type CurrencyCode,
  DEFAULT_CURRENCY,
  MoneyAmountSchema,
  type MoneyAmount,
  MoneySchema,
  type Money,
} from '@findeg/db';

export {
  CurrencyCodeSchema,
  type CurrencyCode,
  DEFAULT_CURRENCY,
  MoneyAmountSchema,
  type MoneyAmount,
  MoneySchema,
  type Money,
};

export function toMoney(amount: MoneyAmount, currency: CurrencyCode = DEFAULT_CURRENCY): Money {
  return { amount, currency };
}
