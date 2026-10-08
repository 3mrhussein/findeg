/**
 * Exact EGP money as integer piasters (1 EGP = 100 piasters), ADR-0007. Amounts travel as
 * `bigint`; decimal text is parsed and produced here without ever passing through a
 * JavaScript `number`, so arithmetic and display stay exact at any size.
 */

/** An optional minus sign, whole digits, and an optional fraction of one or two digits. */
const DECIMAL_TEXT = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;

function assertPiasters(piasters: bigint): void {
  if (typeof piasters !== 'bigint') {
    throw new TypeError(`Expected piasters as a bigint, received ${typeof piasters}`);
  }
}

/**
 * Parses decimal text such as a `decimal(12,2)` column value ("37.50", "-2.5", "25") to
 * piasters without floating point. Anything else (blank or padded text, exponents, grouping,
 * a `+` sign or more than two fraction digits) is rejected with a `RangeError`, never rounded.
 */
export function toPiasters(decimal: string): bigint {
  if (typeof decimal !== 'string') {
    throw new TypeError(`Expected a decimal string, received ${typeof decimal}`);
  }
  const match = DECIMAL_TEXT.exec(decimal);
  if (!match) {
    throw new RangeError(
      `Invalid money amount ${JSON.stringify(decimal)}: expected a decimal with at most 2 fraction digits`,
    );
  }
  const [, sign, whole, fraction = ''] = match;
  const piasters = BigInt(whole!) * 100n + BigInt(fraction.padEnd(2, '0'));
  return sign ? -piasters : piasters;
}

/** Exact two-decimal text for the database boundary, e.g. `3750n` -> "37.50", `-5n` -> "-0.05". */
export function piastersToDecimal(piasters: bigint): string {
  assertPiasters(piasters);
  const sign = piasters < 0n ? '-' : '';
  const absolute = piasters < 0n ? -piasters : piasters;
  return `${sign}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}`;
}

/**
 * Exact EGP display amount in pounds with two decimals, e.g. `1234567890123n` ->
 * "12345678901.23". No currency symbol or digit grouping: localized labels belong to the caller.
 */
export function piastersToEgp(piasters: bigint): string {
  return piastersToDecimal(piasters);
}

/**
 * APPROXIMATE projection to the nearest double, only for legacy JSON boundaries (the Customer
 * Quote response, the Confirmation digest) and charts. It loses precision beyond 2^53 piasters
 * and must never feed exact arithmetic or display; use `bigint` and the decimal text above.
 */
export function fromPiasters(piasters: bigint): number {
  return Number(piastersToDecimal(piasters));
}
