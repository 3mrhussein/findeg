import { OrderError } from './order-error';

declare const reference: unique symbol;

/** Public, human-readable identifier: `FE-` plus six Crockford base32 characters (not a secret). */
export type OrderReference = string & { readonly [reference]: 'OrderReference' };

export const ORDER_REFERENCE_PREFIX = 'FE-';
export const ORDER_REFERENCE_BODY_LENGTH = 6;
export const CROCKFORD_BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const ORDER_REFERENCE_PATTERN = new RegExp(
  `^${ORDER_REFERENCE_PREFIX}[${CROCKFORD_BASE32_ALPHABET}]{${ORDER_REFERENCE_BODY_LENGTH}}$`,
);

/** An Order Reference from text, refused unless it is exactly `FE-` and six Crockford characters. */
export function orderReference(text: string): OrderReference {
  if (typeof text !== 'string') {
    throw new TypeError(`Expected an Order Reference string, received ${typeof text}`);
  }
  if (!ORDER_REFERENCE_PATTERN.test(text)) {
    throw new OrderError(
      'INVALID_ORDER_REFERENCE',
      `Invalid Order Reference ${JSON.stringify(text)}: expected ${ORDER_REFERENCE_PREFIX} and ${ORDER_REFERENCE_BODY_LENGTH} Crockford base32 characters`,
    );
  }
  return text as OrderReference;
}

/**
 * A new Order Reference from a supplied random source, which returns `length` random bytes. Each
 * byte picks one character (`byte % 32`, unbiased because 256 is a multiple of 32). The
 * reference is unique only by chance: the store refuses a duplicate and the caller retries.
 */
export function generateOrderReference(
  randomBytes: (length: number) => Uint8Array,
): OrderReference {
  const bytes = randomBytes(ORDER_REFERENCE_BODY_LENGTH);
  if (bytes.length < ORDER_REFERENCE_BODY_LENGTH) {
    throw new TypeError(
      `Expected ${ORDER_REFERENCE_BODY_LENGTH} random bytes, received ${bytes.length}`,
    );
  }
  let body = '';
  for (let i = 0; i < ORDER_REFERENCE_BODY_LENGTH; i += 1) {
    body += CROCKFORD_BASE32_ALPHABET[bytes[i]! % CROCKFORD_BASE32_ALPHABET.length];
  }
  return orderReference(`${ORDER_REFERENCE_PREFIX}${body}`);
}
