import { expect, it } from 'vitest';
import { allowedAlternatives } from '../public.js';

it('derives alternatives by category and all specified attributes while exposing differences', () => {
  const item = {
    variantId: 1,
    exactItem: false,
    specification: { categoryId: 4, attributes: { ruling: 'lined' } },
  };
  const base = {
    id: 1,
    categoryId: 4,
    brand: { en: 'Alpha', ar: 'ألفا' },
    attributes: { ruling: 'lined', color: 'blue' },
    price: '10.00',
    sku: 'A',
    name: {},
    label: {},
  };
  const alternative = {
    ...base,
    id: 2,
    brand: { en: 'Beta', ar: 'بيتا' },
    price: '8.00',
    attributes: { ruling: 'lined', color: 'red' },
  };
  expect(
    allowedAlternatives(item, [
      base,
      alternative,
      { ...alternative, id: 3, categoryId: 5 },
      { ...alternative, id: 4, attributes: {} },
    ]),
  ).toEqual([base, alternative]);
  expect(allowedAlternatives({ ...item, exactItem: true }, [base, alternative])).toEqual([base]);
});
