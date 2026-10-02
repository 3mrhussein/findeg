import { generateOrderReference, CROCKFORD_BASE32 } from '@findeg/db/schema';

/**
 * Crockford Base32 alphabet (32 characters, excludes I, L, O, U to avoid ambiguity).
 * See ADR-0005: `FE-` plus 6 Crockford base32 characters (e.g. `FE-7K3Q9M`, ~1.07B values).
 */
export const CROCKFORD_BASE32_ALPHABET = CROCKFORD_BASE32;

export const ORDER_REFERENCE_REGEX = /^FE-[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$/;

export { generateOrderReference };

/**
 * Validates whether a string matches the required Order Reference format.
 */
export function isValidOrderReference(reference: string): boolean {
  return ORDER_REFERENCE_REGEX.test(reference);
}
