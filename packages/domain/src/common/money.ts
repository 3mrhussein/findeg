declare const egp: unique symbol;

/**
 * An amount of Egyptian pounds with exactly two decimals (`xx.xx`), never negative. It is held
 * as a `bigint` count of hundredths of a pound (piasters), so no calculation drifts or yields a
 * third decimal.
 */
export type Money = bigint & { readonly [egp]: 'EGP' };
