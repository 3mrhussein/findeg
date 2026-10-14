import { describe, expect, it, vi } from 'vitest';
import type { DbTransaction } from '@findeg/db/queries';
import { fakeDatabase } from '../../../__tests__/fixture';
import { SelectionInvalidError } from '../../checkout-errors/index';

vi.mock('@findeg/db/queries/school-supply-lists', () => ({
  getListOffer: vi.fn(() => Promise.resolve().then(() => undefined)),
}));

import { calculateListQuote } from '../index';

const PUBLIC_CODE = '0123456789abcdef0123456789abcdef';
const list = {
  id: 1,
  status: 'published',
  publicCode: PUBLIC_CODE,
  publishedAt: new Date('2026-09-01T00:00:00Z'),
  businessPartnerId: 3,
};
const variant = {
  id: 2,
  productId: 4,
  sku: 'PEN-BLUE',
  localizedLabel: { en: 'Blue' },
  productName: { en: 'Pen' },
  basePrice: '0.10',
  categoryId: 8,
};

describe('list selection eligibility rules', () => {
  it('accepts a specified item whose category and attributes the variant satisfies', async () => {
    const item = {
      id: 10,
      listId: 1,
      variantId: 2,
      exactItem: false,
      specification: { categoryId: 8, attributes: { color: 'blue' } },
    };
    const fake = fakeDatabase(
      [list],
      [item],
      [variant],
      [
        { variantId: 2, key: 'color', value: 'blue' },
        { variantId: 2, key: 'size', value: null },
      ],
    );
    const calculation = await calculateListQuote(
      { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 1 }] },
      fake.db as unknown as DbTransaction,
    );
    expect(calculation.quote.lines).toHaveLength(1);
  });

  it('rejects a specified item whose attributes the variant does not satisfy', async () => {
    const item = {
      id: 10,
      listId: 1,
      variantId: 2,
      exactItem: false,
      specification: { categoryId: 8, attributes: { color: 'red' } },
    };
    const fake = fakeDatabase(
      [list],
      [item],
      [variant],
      [{ variantId: 2, key: 'color', value: 'blue' }],
    );
    await expect(
      calculateListQuote(
        { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 1 }] },
        fake.db as unknown as DbTransaction,
      ),
    ).rejects.toBeInstanceOf(SelectionInvalidError);
  });

  it('rejects an item that has no default variant to substitute', async () => {
    const item = { id: 10, listId: 1, variantId: null, exactItem: true, specification: null };
    const fake = fakeDatabase([list], [item], [variant], []);
    await expect(
      calculateListQuote(
        { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 1 }] },
        fake.db as unknown as DbTransaction,
      ),
    ).rejects.toMatchObject({ listItemIds: [10] });
  });
});
