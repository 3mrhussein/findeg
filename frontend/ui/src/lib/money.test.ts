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
  ])('formats %s piasters as %s in en', (piasters, text) => {
    expect(formatEgp(piasters, 'en')).toBe(text);
  });

  it('uses Arabic-Indic digits and the Arabic decimal separator in ar', () => {
    expect(formatEgp(3750n, 'ar')).toBe('٣٧٫٥٠');
    expect(formatEgp(5n, 'ar')).toBe('٠٫٠٥');
  });

  it('is exact beyond Number.MAX_SAFE_INTEGER piasters', () => {
    expect(formatEgp(12345678901234567890123456789012n, 'en')).toBe(
      '123456789012345678901234567890.12',
    );
  });

  it('is not sensitive to the regional suffix of the locale', () => {
    expect(formatEgp(3750n, 'ar-EG')).toBe(formatEgp(3750n, 'ar'));
  });
});

describe('formatEgpDecimal', () => {
  it.each([
    ['37.50', '37.50'],
    ['37.5', '37.50'],
    ['25', '25.00'],
    ['0.05', '0.05'],
    ['007.10', '7.10'],
  ])('formats %s as %s in en', (decimal, text) => {
    expect(formatEgpDecimal(decimal, 'en')).toBe(text);
  });

  it.each([[''], [' 37.50'], ['10.005'], ['1,000.00'], ['1e2'], ['+5'], ['abc']])(
    'refuses %j instead of rounding it',
    (decimal) => {
      expect(() => formatEgpDecimal(decimal, 'en')).toThrow(RangeError);
    },
  );
});
