import { describe, expect, it } from 'vitest';
import { LINE_QUANTITY_MAX, LINE_QUANTITY_MIN, isLineQuantity } from '@findeg/domain';

// One rule for cart lines, list items, Quote and Order lines and stock allocation input.
describe('line quantity', () => {
  it('runs from 1 to 999 units', () => {
    expect([LINE_QUANTITY_MIN, LINE_QUANTITY_MAX]).toEqual([1, 999]);
  });

  it.each([1, 2, 999])('accepts %d units', (quantity) => {
    expect(isLineQuantity(quantity)).toBe(true);
  });

  it.each([0, -1, 1000, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'refuses %d units',
    (quantity) => {
      expect(isLineQuantity(quantity)).toBe(false);
    },
  );
});
