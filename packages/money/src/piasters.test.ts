import { describe, expect, it } from 'vitest';
import { fromPiasters, piastersToDecimal, piastersToEgp, toPiasters } from './index';

describe('toPiasters', () => {
  it.each([
    ['0', 0n],
    ['0.00', 0n],
    ['-0.00', 0n],
    ['37.50', 3750n],
    ['37.5', 3750n],
    ['25', 2500n],
    ['0.05', 5n],
    ['10.5', 1050n],
    ['007.10', 710n],
    ['-2.50', -250n],
    ['-0.01', -1n],
    ['1234567890.99', 123456789099n],
    // Beyond Number.MAX_SAFE_INTEGER piasters: exact, never through a double.
    ['92233720368547758.07', 9223372036854775807n],
    ['123456789012345678901234567890.12', 12345678901234567890123456789012n],
  ])('converts %s exactly', (text, piasters) => {
    expect(toPiasters(text)).toBe(piasters);
  });

  it.each([
    [''],
    [' '],
    ['abc'],
    ['10.005'],
    ['37.500'],
    ['1.'],
    ['.5'],
    ['-'],
    ['+5'],
    ['--5'],
    ['1e2'],
    ['1,000.00'],
    ['1 000'],
    [' 37.50'],
    ['37.50 '],
    ['0x10'],
    ['NaN'],
    ['Infinity'],
    ['١٢.٥٠'],
  ])('rejects %j instead of rounding or guessing', (text) => {
    expect(() => toPiasters(text)).toThrow(RangeError);
    expect(() => toPiasters(text)).toThrow(/Invalid money amount/);
  });

  it('rejects non-string input at runtime', () => {
    expect(() => toPiasters(37.5 as unknown as string)).toThrow(TypeError);
    expect(() => toPiasters(null as unknown as string)).toThrow(TypeError);
  });
});

describe('piastersToDecimal', () => {
  it.each([
    [0n, '0.00'],
    [5n, '0.05'],
    [10n, '0.10'],
    [99n, '0.99'],
    [100n, '1.00'],
    [3750n, '37.50'],
    [123456789099n, '1234567890.99'],
    [-1n, '-0.01'],
    [-250n, '-2.50'],
    [-123456789099n, '-1234567890.99'],
    [9223372036854775807n, '92233720368547758.07'],
    [12345678901234567890123456789012n, '123456789012345678901234567890.12'],
  ])('renders %s as %s', (piasters, text) => {
    expect(piastersToDecimal(piasters)).toBe(text);
  });

  it('rejects a number at runtime instead of mixing types', () => {
    expect(() => piastersToDecimal(3750 as unknown as bigint)).toThrow(TypeError);
  });
});

describe('piastersToEgp', () => {
  it.each([
    [0n, '0.00'],
    [5n, '0.05'],
    [12_345n, '123.45'],
    [-250n, '-2.50'],
    [1_234_567_890_123n, '12345678901.23'],
  ])('renders %s as %s EGP without floating point', (piasters, text) => {
    expect(piastersToEgp(piasters)).toBe(text);
  });

  it('rejects a number at runtime instead of mixing types', () => {
    expect(() => piastersToEgp(5 as unknown as bigint)).toThrow(TypeError);
  });
});

describe('fromPiasters (approximate number projection)', () => {
  it('gives the nearest double to the decimal amount', () => {
    expect(fromPiasters(0n)).toBe(0);
    expect(fromPiasters(10n)).toBe(0.1);
    expect(fromPiasters(3010n)).toBe(30.1);
    expect(fromPiasters(-250n)).toBe(-2.5);
  });

  it('loses precision beyond the safe range, which is why exact paths never use it', () => {
    const huge = 9007199254740993n; // 2^53 + 1 piasters
    expect(toPiasters(fromPiasters(huge).toFixed(2))).not.toBe(huge);
  });
});

describe('round trips', () => {
  it.each([
    ['0.00'],
    ['0.01'],
    ['37.50'],
    ['-2.50'],
    ['1234567890.99'],
    ['123456789012345678901234567890.12'],
  ])('decimal %s survives text -> piasters -> text', (text) => {
    expect(piastersToDecimal(toPiasters(text))).toBe(text);
  });

  it.each([[0n], [1n], [-1n], [99n], [-100n], [3750n], [12345678901234567890123456789012n]])(
    'piasters %s survive piasters -> text -> piasters',
    (piasters) => {
      expect(toPiasters(piastersToDecimal(piasters))).toBe(piasters);
      expect(toPiasters(piastersToEgp(piasters))).toBe(piasters);
    },
  );

  it('sums exactly where float math diverges', () => {
    const total = ['0.10', '0.20'].map(toPiasters).reduce((sum, p) => sum + p, 0n);
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(piastersToDecimal(total)).toBe('0.30');
  });
});
