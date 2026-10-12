import { describe, expect, it } from 'vitest';
import { DomainError, money, moneyFromDecimal, moneyToDecimal } from '@findeg/domain/common';
import { priceListOfferLine } from '@findeg/domain/orders';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
}

// Ported from checkout's list-offer tests (ADR-0007): the line total is
// roundHalfUp(gross x (10000 - bps) / 10000), rounded once per line to two decimals.
describe('List Offer line pricing', () => {
  it.each([
    // [unit hundredths, quantity, basis points, expected line total in hundredths]
    [1000n, 1, 0, 1000n],
    [1000n, 1, 10000, 0n],
    [1000n, 3, 1000, 2700n],
    [1050n, 1, 1000, 945n], // exact
    [1005n, 1, 1000, 905n], // 904.5 -> half rounds up
    [1001n, 1, 1000, 901n], // 900.9 -> 901
    [1004n, 1, 1000, 904n], // 903.6 -> 904
    [3n, 1, 5000, 2n], // 1.5 -> 2
    [1n, 1, 5000, 1n], // 0.5 -> 1
    [1n, 1, 4999, 1n], // 0.5001 -> 1
    [1n, 1, 5001, 0n], // 0.4999 -> 0
    [333n, 3, 3333, 666n], // rounds once on the line, not per unit: 999 x 0.6667 = 666.0333
    [999n, 7, 1250, 6119n], // 6993 x 0.875 = 6118.875 -> 6119
  ])('unit %s x %s at %s bps', (unit, quantity, basisPoints, expected) => {
    expect(priceListOfferLine(money(unit), quantity, basisPoints).lineTotal).toBe(money(expected));
  });

  it('reports gross, discount and line total that add up', () => {
    const line = priceListOfferLine(money(1005n), 2, 1000);
    expect(line.gross).toBe(money(2010n));
    expect(line.lineTotal).toBe(money(1809n));
    expect(line.discount).toBe(money(201n));
    expect(line.lineTotal + line.discount).toBe(line.gross);
  });

  it('rounds once per line rather than per unit', () => {
    // Per-unit rounding would give 2 x 9.05 = 18.10; per line 20.10 x 0.9 = 18.09.
    const line = priceListOfferLine(moneyFromDecimal('10.05'), 2, 1000);
    expect(moneyToDecimal(line.lineTotal)).toBe('18.09');
    expect(moneyToDecimal(line.discount)).toBe('2.01');
  });

  it('prices a line without an offer at its gross', () => {
    expect(priceListOfferLine(money(1234n), 2, null)).toEqual({
      gross: money(2468n),
      lineTotal: money(2468n),
      discount: money(0n),
    });
  });

  it.each([[-1], [10001], [12.5], [Number.NaN]])('refuses %s basis points', (basisPoints) => {
    expect(codeOf(() => priceListOfferLine(money(1000n), 1, basisPoints))).toBe(
      'INVALID_BASIS_POINTS',
    );
  });
});
