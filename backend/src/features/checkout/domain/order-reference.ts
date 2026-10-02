import { randomBytes } from 'node:crypto';

/**
 * Crockford Base32 alphabet (32 characters, excludes I, L, O, U to avoid ambiguity).
 * See ADR-0005: `FE-` plus 6 Crockford base32 characters (e.g. `FE-7K3Q9M`, ~1.07B values).
 */
export const CROCKFORD_BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const ORDER_REFERENCE_REGEX = /^FE-[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$/;

/**
 * Generates an opaque, human-readable Order Reference.
 * Format: `FE-` followed by 6 Crockford base32 characters.
 */
export function generateOrderReference(): string {
  const bytes = randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CROCKFORD_BASE32_ALPHABET[bytes[i] % 32];
  }
  return `FE-${code}`;
}

/**
 * Validates whether a string matches the required Order Reference format.
 */
export function isValidOrderReference(reference: string): boolean {
  return ORDER_REFERENCE_REGEX.test(reference);
}
