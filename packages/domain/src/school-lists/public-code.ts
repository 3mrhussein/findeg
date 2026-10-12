import { SupplyListError } from './supply-list-error';

declare const brand: unique symbol;

/** A list's public, unguessable code (SL-6): 32 lowercase hex characters, 128 random bits. */
export type PublicCode = string & { readonly [brand]: 'PublicCode' };

/** Returns `length` random bytes, e.g. `(n) => crypto.getRandomValues(new Uint8Array(n))`. */
export type RandomBytes = (length: number) => Uint8Array;

const PUBLIC_CODE_BYTES = 16;
export const PUBLIC_CODE_PATTERN = /^[0-9a-f]{32}$/;

/** Parses a public code, refusing anything but exactly 32 lowercase hex characters. */
export function publicCode(text: string): PublicCode {
  if (typeof text !== 'string') throw new TypeError('A public code is a string');
  if (!PUBLIC_CODE_PATTERN.test(text)) {
    throw new SupplyListError(
      'INVALID_PUBLIC_CODE',
      'A public code is 32 lowercase hex characters',
    );
  }
  return text as PublicCode;
}

/** A new public code made from 16 bytes of the supplied random source. */
export function generatePublicCode(random: RandomBytes): PublicCode {
  const bytes = random(PUBLIC_CODE_BYTES);
  if (bytes.length !== PUBLIC_CODE_BYTES) {
    throw new TypeError(
      `The random source returned ${bytes.length} bytes, not ${PUBLIC_CODE_BYTES}`,
    );
  }
  return publicCode(Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''));
}
