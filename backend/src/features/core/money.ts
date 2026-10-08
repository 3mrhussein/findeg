/** Exact money conversions shared by Quotes, Orders and Partner Reports. */
export function toPiasters(decimal: string): bigint {
  const text = decimal.trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(text)) {
    throw new Error(`Invalid decimal amount ${JSON.stringify(decimal)}`);
  }
  const negative = text.startsWith('-');
  const [whole, fraction = ''] = (negative ? text.slice(1) : text).split('.');
  const amount = BigInt(whole!) * 100n + BigInt(fraction.padEnd(2, '0'));
  return negative ? -amount : amount;
}

export function piastersToDecimal(piasters: bigint): string {
  const sign = piasters < 0n ? '-' : '';
  const absolute = piasters < 0n ? -piasters : piasters;
  return `${sign}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}`;
}

/** Number projection for existing JSON contracts and chart coordinates only. */
export function fromPiasters(piasters: bigint): number {
  return Number(piastersToDecimal(piasters));
}

/** EGP display text without floating-point conversion. */
export const piastersToEgp = piastersToDecimal;
