declare const egp: unique symbol;

/**
 * An amount of Egyptian pounds with exactly two decimals (`xx.xx`), never negative. It is held
 * as a `bigint` count of hundredths of a pound (piasters), so no calculation drifts or yields a
 * third decimal. Make one with `money` or `moneyFromDecimal`; plain `bigint` maths loses the
 * brand on purpose, so every result goes back through the checks here.
 */
export type Money = bigint & { readonly [egp]: 'EGP' };

export type MoneyErrorCode = 'INVALID_MONEY_AMOUNT' | 'NEGATIVE_MONEY' | 'INVALID_QUANTITY';
