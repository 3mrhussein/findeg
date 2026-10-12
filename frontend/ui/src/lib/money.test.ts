import { describe, expect, it } from 'vitest';
import { formatEgp, formatEgpDecimal } from './money';

describe('formatEgp', () => {
  it.each([
    [0n, '0.00'],
    [5n, '0.05'],
    [3750n, '37.50'],
    [2500n, '25.00'],
    [1_234_567_890_123n, '12345678901.23'],
    [-250n, '-2.50'],
  ])('formats %s piasters as %s', (piasters, text) => {
    expect(formatEgp(piasters)).toBe(text);
  });

  it('is exact beyond Number.MAX_SAFE_INTEGER piasters', () => {
    expect(formatEgp(12345678901234567890123456789012n)).toBe('123456789012345678901234567890.12');
  });
});

describe('formatEgpDecimal', () => {
  it.each([
    ['37.50', '37.50'],
    ['37.5', '37.50'],
    ['25', '25.00'],
    ['0.05', '0.05'],
    ['007.10', '7.10'],
    ['-2.5', '-2.50'],
  ])('formats %s as %s', (decimal, text) => {
    expect(formatEgpDecimal(decimal)).toBe(text);
  });

  it.each([[''], [' 37.50'], ['10.005'], ['1,000.00'], ['1e2'], ['+5'], ['abc']])(
    'refuses %j instead of rounding it',
    (decimal) => {
      expect(() => formatEgpDecimal(decimal)).toThrow(RangeError);
    },
  );
});
