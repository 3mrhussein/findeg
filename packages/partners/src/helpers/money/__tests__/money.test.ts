import { expect, it } from 'vitest';
import { sumSalesFigures } from '../index';

it('adds quantities and charged piasters of every sales row', () => {
  expect(
    sumSalesFigures([
      { quantity: 2, chargedPiasters: 1500n },
      { quantity: 3, chargedPiasters: 250n },
    ]),
  ).toEqual({ quantity: 5, chargedPiasters: 1750n });
});

it('totals no rows to zero', () => {
  expect(sumSalesFigures([])).toEqual({ quantity: 0, chargedPiasters: 0n });
});
