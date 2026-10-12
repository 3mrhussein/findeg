import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import {
  ORDER_REFERENCE_PATTERN,
  generateOrderReference,
  orderReference,
} from '@findeg/domain/orders';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
}

/** A random source that hands out the given bytes and records how many were asked for. */
function bytes(...values: number[]) {
  const requested: number[] = [];
  const source = (length: number) => {
    requested.push(length);
    return Uint8Array.from(values.slice(0, length));
  };
  return { source, requested };
}

// Ported from db's generator: six random bytes, each mapped to `alphabet[byte % 32]`.
describe('Order Reference', () => {
  it('generates FE- plus six Crockford base32 characters from six random bytes', () => {
    const random = bytes(0, 31, 32, 255, 7, 100);
    expect(generateOrderReference(random.source)).toBe('FE-0Z0Z74');
    expect(random.requested).toEqual([6]);
  });

  it('maps every byte value onto the alphabet', () => {
    for (let start = 0; start < 256; start += 6) {
      const values = [0, 1, 2, 3, 4, 5].map((offset) => (start + offset) % 256);
      const reference = generateOrderReference(bytes(...values).source);
      expect(reference).toMatch(ORDER_REFERENCE_PATTERN);
      expect(orderReference(reference)).toBe(reference);
    }
  });

  it('parses a valid reference', () => {
    expect(orderReference('FE-7K3Q9M')).toBe('FE-7K3Q9M');
  });

  it.each([
    ['an excluded letter', 'FE-7K3Q9I'],
    ['a short body', 'FE-7K3Q9'],
    ['a long body', 'FE-7K3Q9MM'],
    ['lower case', 'fe-7k3q9m'],
    ['padding', ' FE-7K3Q9M'],
    ['another prefix', 'FA-7K3Q9M'],
    ['nothing', ''],
  ])('refuses %s', (_name, text) => {
    expect(codeOf(() => orderReference(text))).toBe('INVALID_ORDER_REFERENCE');
  });
});
