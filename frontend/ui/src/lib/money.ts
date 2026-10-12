/**
 * The one EGP money formatter for both apps.
 *
 * Amounts are exact: a `bigint` count of piasters (hundredths of a pound), the same
 * representation as the domain's `Money`, or strict decimal text as stored in the database.
 * Output is always `xx.xx`: two decimals, ASCII digits and a `.` separator, identical in `en` and
 * `ar`, so an amount reads the same on either locale's pages. There is no currency symbol and no
 * digit grouping, so callers keep their own currency labels. No value is ever rounded: text that
 * is not an exact decimal with at most two fraction digits is refused.
 */

const DECIMAL_TEXT = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;

/** Format a whole number of piasters as `xx.xx`, e.g. `3750n` -> "37.50". */
export function formatEgp(piasters: bigint): string {
  if (typeof piasters !== 'bigint') {
    throw new TypeError(`Expected piasters as a bigint, received ${typeof piasters}`);
  }
  const sign = piasters < 0n ? '-' : '';
  const absolute = piasters < 0n ? -piasters : piasters;
  const cents = (absolute % 100n).toString().padStart(2, '0');
  return `${sign}${absolute / 100n}.${cents}`;
}

/**
 * Format strict decimal text such as "37.50", "25" or "-2.5" as `xx.xx`. Anything else (blank or
 * padded text, exponents, grouping, a `+` sign or more than two fraction digits) throws a
 * `RangeError`; it is never rounded.
 */
export function formatEgpDecimal(decimal: string): string {
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
  return formatEgp(sign ? -piasters : piasters);
}
