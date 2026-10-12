import { DomainError } from './domain-error';

declare const egp: unique symbol;

/**
 * An amount of Egyptian pounds with exactly two decimals (`xx.xx`), never negative. It is held
 * as a `bigint` count of hundredths of a pound (piasters), so no calculation drifts or yields a
 * third decimal. Make one with `money` or `moneyFromDecimal`; plain `bigint` maths loses the
 * brand on purpose, so every result goes back through the checks here.
 */
export type Money = bigint & { readonly [egp]: 'EGP' };

export type MoneyErrorCode = 'INVALID_MONEY_AMOUNT' | 'NEGATIVE_MONEY' | 'INVALID_QUANTITY';

/** An amount that is not valid Money. */
export class MoneyError extends DomainError<MoneyErrorCode> {
  constructor(code: MoneyErrorCode, message: string) {
    super(code, message);
  }
}

const HUNDREDTHS_PER_POUND = 100n;

/** Whole pounds and an optional fraction of one or two digits, with an optional leading minus. */
const DECIMAL_TEXT = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;

/** Money from a count of hundredths of a pound. A negative amount is refused. */
export function money(hundredths: bigint): Money {
  if (typeof hundredths !== 'bigint') {
    throw new TypeError(`Expected hundredths as a bigint, received ${typeof hundredths}`);
  }
  if (hundredths < 0n) {
    throw new MoneyError('NEGATIVE_MONEY', `Money cannot be negative: ${hundredths} hundredths`);
  }
  return hundredths as Money;
}

/**
 * Money from a decimal string such as a `decimal(…, 2)` column value ("37.50", "25"). Anything
 * else (blank or padded text, exponents, grouping, a sign, or more than two decimals) is
 * refused, never rounded.
 */
export function moneyFromDecimal(decimal: string): Money {
  if (typeof decimal !== 'string') {
    throw new TypeError(`Expected a decimal string, received ${typeof decimal}`);
  }
  const match = DECIMAL_TEXT.exec(decimal);
  if (!match) {
    throw new MoneyError(
      'INVALID_MONEY_AMOUNT',
      `Invalid money amount ${JSON.stringify(decimal)}: expected a decimal with at most 2 decimals`,
    );
  }
  const [, sign, pounds, fraction = ''] = match;
  if (sign) {
    throw new MoneyError('NEGATIVE_MONEY', `Money cannot be negative: ${JSON.stringify(decimal)}`);
  }
  return money(BigInt(pounds!) * HUNDREDTHS_PER_POUND + BigInt(fraction.padEnd(2, '0')));
}

/** The exact `xx.xx` string the database stores, e.g. 3750 hundredths -> "37.50". */
export function moneyToDecimal(amount: Money): string {
  const hundredths = money(amount);
  const pounds = hundredths / HUNDREDTHS_PER_POUND;
  const fraction = (hundredths % HUNDREDTHS_PER_POUND).toString().padStart(2, '0');
  return `${pounds}.${fraction}`;
}

/** Zero pounds. */
export const ZERO_MONEY: Money = money(0n);

export function addMoney(a: Money, b: Money): Money {
  return money(a + b);
}

/** `a - b`. A result below zero is refused: Money is never negative. */
export function subtractMoney(a: Money, b: Money): Money {
  return money(a - b);
}

/** The amount for a whole, non-negative quantity, e.g. a unit price times a line quantity. */
export function multiplyMoney(amount: Money, quantity: number): Money {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new MoneyError(
      'INVALID_QUANTITY',
      `Expected a whole, non-negative quantity, received ${quantity}`,
    );
  }
  return money(amount * BigInt(quantity));
}

export function sumMoney(amounts: readonly Money[]): Money {
  return amounts.reduce(addMoney, ZERO_MONEY);
}

/** -1 when `a` is less than `b`, 0 when equal, 1 when greater. */
export function compareMoney(a: Money, b: Money): -1 | 0 | 1 {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}
