import { describe, expect, it } from 'vitest';
import {
  DomainError,
  MoneyError,
  addMoney,
  compareMoney,
  money,
  moneyFromDecimal,
  moneyToDecimal,
  multiplyMoney,
  subtractMoney,
  sumMoney,
} from '@findeg/domain';

/** The error code a call fails with, or `undefined` when it does not fail. */
function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error: unknown) {
    if (error instanceof DomainError) return error.code as string;
    throw error;
  }
}

// Ported from @findeg/money (piasters.test.ts) and checkout's shipping-fee cases.
describe('Money from a decimal string', () => {
  it.each([
    ['0', 0n],
    ['0.00', 0n],
    ['37.50', 3750n],
    ['37.5', 3750n],
    ['25', 2500n],
    ['0.05', 5n],
    ['10.5', 1050n],
    ['007.10', 710n],
    ['12.99', 1299n],
    ['50', 5000n],
    ['49.99', 4999n],
    ['1234567890.99', 123456789099n],
    // Beyond Number.MAX_SAFE_INTEGER hundredths: exact, never through a double.
    ['92233720368547758.07', 9223372036854775807n],
    ['123456789012345678901234567890.12', 12345678901234567890123456789012n],
  ])('reads %s exactly', (text, hundredths) => {
    expect(moneyFromDecimal(text)).toBe(money(hundredths));
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
  ])('refuses %j instead of rounding or guessing', (text) => {
    expect(codeOf(() => moneyFromDecimal(text))).toBe('INVALID_MONEY_AMOUNT');
    expect(() => moneyFromDecimal(text)).toThrow(MoneyError);
  });

  it('refuses more than two decimals rather than rounding them', () => {
    expect(codeOf(() => moneyFromDecimal('0.001'))).toBe('INVALID_MONEY_AMOUNT');
    expect(codeOf(() => moneyFromDecimal('12.999'))).toBe('INVALID_MONEY_AMOUNT');
  });

  // Rule change (approved 2026-10-12): Money is never negative. @findeg/money read these.
  it.each([['-2.50'], ['-0.01'], ['-0.00'], ['-5']])('refuses the negative amount %s', (text) => {
    expect(codeOf(() => moneyFromDecimal(text))).toBe('NEGATIVE_MONEY');
  });

  it('refuses a non-string at runtime', () => {
    expect(() => moneyFromDecimal(37.5 as unknown as string)).toThrow(TypeError);
    expect(() => moneyFromDecimal(null as unknown as string)).toThrow(TypeError);
  });
});

describe('Money as a decimal string', () => {
  it.each([
    [0n, '0.00'],
    [5n, '0.05'],
    [10n, '0.10'],
    [99n, '0.99'],
    [100n, '1.00'],
    [1200n, '12.00'],
    [3750n, '37.50'],
    [12_345n, '123.45'],
    [123456789099n, '1234567890.99'],
    [1_234_567_890_123n, '12345678901.23'],
    [9223372036854775807n, '92233720368547758.07'],
    [12345678901234567890123456789012n, '123456789012345678901234567890.12'],
  ])('writes %s hundredths as %s', (hundredths, text) => {
    expect(moneyToDecimal(money(hundredths))).toBe(text);
  });

  it.each([['0.00'], ['0.01'], ['12.00'], ['37.50'], ['1234567890.99']])(
    '%s survives string -> Money -> string',
    (text) => {
      expect(moneyToDecimal(moneyFromDecimal(text))).toBe(text);
    },
  );

  it('always writes two decimals', () => {
    expect(moneyToDecimal(moneyFromDecimal('12'))).toBe('12.00');
    expect(moneyToDecimal(moneyFromDecimal('12.5'))).toBe('12.50');
  });
});

describe('Money from hundredths', () => {
  it.each([[0n], [1n], [99n], [3750n], [12345678901234567890123456789012n]])(
    '%s hundredths survive Money -> string -> Money',
    (hundredths) => {
      expect(moneyFromDecimal(moneyToDecimal(money(hundredths)))).toBe(money(hundredths));
    },
  );

  // Rule change (approved 2026-10-12): Money is never negative.
  it('refuses a negative amount', () => {
    expect(codeOf(() => money(-1n))).toBe('NEGATIVE_MONEY');
  });

  it('refuses a number at runtime instead of mixing types', () => {
    expect(() => money(3750 as unknown as bigint)).toThrow(TypeError);
  });
});

describe('Money arithmetic', () => {
  const egp = moneyFromDecimal;

  it('adds exactly where float maths drifts', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(moneyToDecimal(addMoney(egp('0.10'), egp('0.20')))).toBe('0.30');
  });

  // Ported from checkout's sumQuote: ten 0.10 lines sum to 1.00, not 0.9999999999999999.
  it('sums many amounts exactly', () => {
    const lines = Array.from({ length: 10 }, () => egp('0.10'));
    expect(moneyToDecimal(sumMoney(lines))).toBe('1.00');
    expect(moneyToDecimal(addMoney(sumMoney(lines), egp('50.00')))).toBe('51.00');
  });

  it('sums nothing to zero', () => {
    expect(moneyToDecimal(sumMoney([]))).toBe('0.00');
  });

  it('subtracts down to zero', () => {
    expect(moneyToDecimal(subtractMoney(egp('12.99'), egp('2.99')))).toBe('10.00');
    expect(moneyToDecimal(subtractMoney(egp('12.99'), egp('12.99')))).toBe('0.00');
  });

  // Rule change (approved 2026-10-12): Money is never negative.
  it('refuses a subtraction that would go below zero', () => {
    expect(codeOf(() => subtractMoney(egp('1.00'), egp('1.01')))).toBe('NEGATIVE_MONEY');
  });

  it.each([
    ['12.99', 0, '0.00'],
    ['12.99', 1, '12.99'],
    ['12.99', 3, '38.97'],
    ['0.10', 999, '99.90'],
  ])('multiplies %s by quantity %s to %s', (amount, quantity, total) => {
    expect(moneyToDecimal(multiplyMoney(egp(amount), quantity))).toBe(total);
  });

  it.each([[-1], [1.5], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'refuses to multiply by the quantity %s',
    (quantity) => {
      expect(codeOf(() => multiplyMoney(egp('1.00'), quantity))).toBe('INVALID_QUANTITY');
    },
  );

  it('compares amounts', () => {
    expect(compareMoney(egp('1.00'), egp('2.00'))).toBe(-1);
    expect(compareMoney(egp('2.00'), egp('2'))).toBe(0);
    expect(compareMoney(egp('2.01'), egp('2.00'))).toBe(1);
  });
});
