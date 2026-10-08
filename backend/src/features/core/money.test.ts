import { describe, expect, it } from 'vitest';
import { fromPiasters, piastersToDecimal, toPiasters } from './money';

describe('exact money conversion', () => {
  it.each([
    ['0', 0n],
    ['0.01', 1n],
    ['12.5', 1250n],
    ['-0.05', -5n],
    ['-12.50', -1250n],
    ['12345678901234567890.99', 1234567890123456789099n],
  ])('converts %s without rounding', (text, amount) => {
    expect(toPiasters(text)).toBe(amount);
    expect(toPiasters(piastersToDecimal(amount))).toBe(amount);
  });

  it.each(['', 'abc', '1.005', '1e2', 'Infinity', '1.', '.5', '--1', '1.2.3'])(
    'rejects malformed or overprecise amounts: %s',
    (text) => {
      expect(() => toPiasters(text)).toThrow('Invalid decimal amount');
    },
  );

  it('projects EGP for existing number contracts only', () => {
    expect(fromPiasters(3010n)).toBe(30.1);
    expect(piastersToDecimal(10n + 20n)).toBe('0.30');
  });
});
