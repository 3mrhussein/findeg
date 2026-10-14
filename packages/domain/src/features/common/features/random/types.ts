/** Returns `length` random bytes, e.g. `(n) => crypto.getRandomValues(new Uint8Array(n))`. */
export type RandomBytes = (length: number) => Uint8Array;
