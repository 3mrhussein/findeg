import { describe, expect, it } from 'vitest';
import { drawRandomBytes } from '..';

describe('drawRandomBytes', () => {
  it('returns exactly the requested number of bytes from the random source', () => {
    const bytes = drawRandomBytes((length) => new Uint8Array(length).fill(7), 4);
    expect([...bytes]).toEqual([7, 7, 7, 7]);
  });

  it('refuses a random source that returns a different number of bytes', () => {
    expect(() => drawRandomBytes(() => new Uint8Array(3), 4)).toThrow(
      'The random source returned 3 bytes, not 4',
    );
  });
});
