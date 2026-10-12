/**
 * The one EGP money formatter for both apps.
 *
 * Amounts are exact: a `bigint` count of piasters (hundredths of a pound), the same
 * representation as the domain's `Money`, or strict `xx.xx` decimal text as stored in the
 * database. Output is always two decimals, with no currency symbol and no digit grouping, so
 * callers keep their own currency labels. `en` uses Latin digits and `.`; `ar` uses Arabic-Indic
 * digits and the Arabic decimal separator. No value is ever rounded: text that is not an exact
 * decimal with at most two fraction digits is refused.
 */

const DECIMAL_TEXT = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;

function intlLocale(locale: string): 'ar-EG' | 'en-EG' {
  return locale.toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-EG';
}

/** Format a whole number of piasters as `xx.xx` in the given locale, e.g. `3750n` -> "37.50". */
export function formatEgp(piasters: bigint, locale: string): string {
  if (typeof piasters !== 'bigint') {
    throw new TypeError(`Expected piasters as a bigint, received ${typeof piasters}`);
  }
  const numberLocale = intlLocale(locale);
  const sign = piasters < 0n ? '-' : '';
  const absolute = piasters < 0n ? -piasters : piasters;
  const pounds = new Intl.NumberFormat(numberLocale, { useGrouping: false }).format(
    absolute / 100n,
  );
  const cents = new Intl.NumberFormat(numberLocale, {
    useGrouping: false,
    minimumIntegerDigits: 2,
  }).format(absolute % 100n);
  const separator = new Intl.NumberFormat(numberLocale)
    .formatToParts(1.5)
    .find((part) => part.type === 'decimal')!.value;
  return `${sign}${pounds}${separator}${cents}`;
}

/**
 * Format strict decimal text such as "37.50", "25" or "-2.5" as `xx.xx` in the given locale.
 * Anything else (blank or padded text, exponents, grouping, a `+` sign or more than two fraction
 * digits) throws a `RangeError`; it is never rounded.
 */
export function formatEgpDecimal(decimal: string, locale: string): string {
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
  return formatEgp(sign ? -piasters : piasters, locale);
}
