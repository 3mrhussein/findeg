const EGP_AMOUNT = /^(-?)(\d{1,10})(?:\.(\d{1,2}))?$/;

/** Parses a signed EGP decimal string to exact piasters. Never goes through a JS number. */
export function parseEgpPiasters(value: unknown): bigint | undefined {
  if (typeof value !== 'string') return undefined;
  const match = EGP_AMOUNT.exec(value.trim());
  if (!match) return undefined;
  const [, sign, pounds, piasters = ''] = match;
  const magnitude = BigInt(pounds) * 100n + BigInt(piasters.padEnd(2, '0'));
  return sign ? -magnitude : magnitude;
}
