/** Returns `length` random bytes, e.g. `(n) => crypto.getRandomValues(new Uint8Array(n))`. */
export type RandomBytes = (length: number) => Uint8Array;

/**
 * Exactly `length` bytes from a random source. A source that returns any other number is a
 * programmer error, so it throws a `TypeError` rather than a `DomainError`.
 */
export function drawRandomBytes(random: RandomBytes, length: number): Uint8Array {
  const bytes = random(length);
  if (bytes.length !== length) {
    throw new TypeError(`The random source returned ${bytes.length} bytes, not ${length}`);
  }
  return bytes;
}
