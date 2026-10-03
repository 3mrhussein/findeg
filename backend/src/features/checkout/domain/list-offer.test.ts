import { describe, expect, it } from 'vitest';
import { isOfferActive, priceLine, toPiasters } from './list-offer';

describe('toPiasters', () => {
  it.each([
    ['37.50', 3750n],
    ['25', 2500n],
    ['0.05', 5n],
    ['1234567890.99', 123456789099n],
    ['10.5', 1050n],
  ])('converts %s exactly', (price, piasters) => {
    expect(toPiasters(price)).toBe(piasters);
  });
});

describe('priceLine rounding', () => {
  // gross (piasters) x (10000 - bps) / 10000, rounded half-up once per line
  it.each([
    // [unit piasters, qty, bps, expected line total]
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
    [333n, 3, 3333, 666n], // rounds once on the line, not per unit: 999*0.6667=666.0333
    [999n, 7, 1250, 6119n], // 6993 x 0.875 = 6118.875 -> 6119
  ])('unit %s x %s at %s bps', (unit, quantity, bps, expected) => {
    expect(priceLine(unit, quantity, bps).lineTotal).toBe(expected);
  });

  it('reports gross, discount and line total that add up', () => {
    const line = priceLine(1005n, 2, 1000);
    expect(line.gross).toBe(2010n);
    expect(line.lineTotal).toBe(1809n); // 1809.0
    expect(line.discount).toBe(201n);
    expect(line.lineTotal + line.discount).toBe(line.gross);
  });

  it('rounds once per line rather than per unit', () => {
    // per-unit rounding would give 2 x 905 = 1810; per line 2010 * 0.9 = 1809
    expect(priceLine(1005n, 2, 1000).lineTotal).toBe(1809n);
  });

  it('prices without an offer as gross', () => {
    expect(priceLine(1234n, 2, null)).toEqual({ gross: 2468n, lineTotal: 2468n, discount: 0n });
  });
});

describe('isOfferActive', () => {
  const startsAt = new Date('2026-10-01T00:00:00Z');
  const endsAt = new Date('2026-11-01T00:00:00Z');

  it('is inclusive of the start and exclusive of the end', () => {
    expect(isOfferActive({ startsAt, endsAt }, new Date(startsAt.getTime() - 1))).toBe(false);
    expect(isOfferActive({ startsAt, endsAt }, startsAt)).toBe(true);
    expect(isOfferActive({ startsAt, endsAt }, new Date(endsAt.getTime() - 1))).toBe(true);
    expect(isOfferActive({ startsAt, endsAt }, endsAt)).toBe(false);
  });

  it('treats a null end as open-ended', () => {
    expect(isOfferActive({ startsAt, endsAt: null }, new Date('2099-01-01T00:00:00Z'))).toBe(true);
  });
});
