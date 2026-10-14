import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

/** A fresh 6-digit code; minted per email attempt and never stored. */
export function mintCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** The only form in which a code is persisted: an HMAC bound to its request. */
export function hashCode(requestId: string, code: string, secret: string): string {
  return createHmac('sha256', secret).update(`${requestId}:${code}`).digest('hex');
}

/** True when `code` is one of the codes whose hashes are stored for the request. */
export function matchesAnyHash(
  requestId: string,
  code: string,
  storedHashes: string[],
  secret: string,
): boolean {
  const candidate = Buffer.from(hashCode(requestId, code, secret));
  return storedHashes.reduce((found, stored) => {
    const buf = Buffer.from(stored);
    return (buf.length === candidate.length && timingSafeEqual(buf, candidate)) || found;
  }, false);
}
