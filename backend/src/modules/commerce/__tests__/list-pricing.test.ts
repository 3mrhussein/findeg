import { expect, it } from 'vitest';
import { priceListSelection } from '../public.js';

it('prices incomplete selections with a List Offer on every line and rounds line amounts in piasters', () => {
  const list = {
    id: 7,
    businessPartnerId: 4,
    items: [
      { id: 11, variantId: 1, quantity: 3, required: true, exactItem: false },
      { id: 12, variantId: 2, quantity: 1, required: false, exactItem: true },
    ],
  };
  const variants = [
    { id: 1, price: '0.10', sku: 'A', name: {}, label: {} },
    { id: 2, price: '12.50', sku: 'B', name: {}, label: {} },
  ];
  const selection = {
    setCount: 2,
    items: [
      { listItemId: 11, variantId: 1, quantity: 1 },
      { listItemId: 12, variantId: 2, quantity: 1 },
    ],
  };
  const result = priceListSelection(list, selection, variants, 5000);
  expect(result.subtotal).toBe('6.30');
  expect(result.completeness).toEqual({
    complete: false,
    required: [{ listItemId: 11, expected: 6, selected: 1 }],
  });
  expect(result.items[0]).toMatchObject({
    lineTotal: '0.05',
    attribution: {
      listId: 7,
      listItemId: 11,
      businessPartnerId: 4,
      defaultVariantId: 1,
      alternative: false,
      catalogUnitPrice: '0.10',
      offerBasisPoints: 5000,
      discountAmount: '0.05',
    },
  });
  expect(priceListSelection(list, selection, variants, 10000).subtotal).toBe('0.00');
});
