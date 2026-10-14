import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbTransaction } from '@findeg/db/queries';
import { fakeDatabase } from '../../../__tests__/fixture';
import { ListUnavailableError, SelectionInvalidError } from '../../checkout-errors/helpers';

const offers = vi.hoisted((): { current: unknown } => ({ current: undefined }));
vi.mock('@findeg/db/queries/school-supply-lists', () => ({
  getListOffer: vi.fn(() => Promise.resolve().then(() => offers.current)),
}));

import { calculateListQuote } from '../index';

const PUBLIC_CODE = '0123456789abcdef0123456789abcdef';

const publishedList = {
  id: 1,
  status: 'published',
  publicCode: PUBLIC_CODE,
  publishedAt: new Date('2026-09-01T00:00:00Z'),
  businessPartnerId: 3,
};

const item = { id: 10, listId: 1, variantId: 2, exactItem: true, specification: null };

const variant = {
  id: 2,
  productId: 4,
  sku: 'PEN-BLUE',
  localizedLabel: { en: 'Blue' },
  productName: { en: 'Pen' },
  basePrice: '0.10',
  categoryId: 8,
};

describe('list checkout quote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    offers.current = undefined;
  });

  it('refuses a list that is not published', async () => {
    const fake = fakeDatabase([{ ...publishedList, status: 'draft' }]);
    await expect(
      calculateListQuote(
        { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 1 }] },
        fake.db as unknown as DbTransaction,
      ),
    ).rejects.toBeInstanceOf(ListUnavailableError);
  });

  it('reports an empty selection and unknown items by list item id', async () => {
    const empty = fakeDatabase([publishedList], [item]);
    await expect(
      calculateListQuote(
        { publicCode: PUBLIC_CODE, lines: [] },
        empty.db as unknown as DbTransaction,
      ),
    ).rejects.toMatchObject({ listItemIds: [] });

    const unknown = fakeDatabase([publishedList], [item]);
    await expect(
      calculateListQuote(
        { publicCode: PUBLIC_CODE, lines: [{ listItemId: 99, variantId: 2, quantity: 1 }] },
        unknown.db as unknown as DbTransaction,
      ),
    ).rejects.toMatchObject({ listItemIds: [99] });
    expect(SelectionInvalidError).toBeDefined();
  });

  it('applies the List Offer active at acceptance and attributes the list', async () => {
    offers.current = {
      id: 1,
      supplyListId: 1,
      basisPoints: 1000,
      startsAt: new Date('2026-09-01T00:00:00Z'),
      endsAt: null,
    };
    const fake = fakeDatabase([publishedList], [item], [variant], []);
    const calculation = await calculateListQuote(
      { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 2 }] },
      fake.db as unknown as DbTransaction,
      new Date('2026-10-14T10:00:00Z'),
    );
    expect(calculation.attribution.listOfferBasisPoints).toBe(1000);
    expect(calculation.quote.lines[0].discounts.length).toBeGreaterThan(0);
  });

  it('flags a selection whose variant is not eligible for the item', async () => {
    const specified = {
      ...item,
      exactItem: false,
      specification: { categoryId: 99, attributes: {} },
    };
    const fake = fakeDatabase([publishedList], [specified], [variant], []);
    await expect(
      calculateListQuote(
        { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 1 }] },
        fake.db as unknown as DbTransaction,
      ),
    ).rejects.toMatchObject({ listItemIds: [10] });
  });

  it('flags duplicate, out-of-range and unknown selections by list item id', async () => {
    const fake = fakeDatabase([publishedList], [item]);
    await expect(
      calculateListQuote(
        {
          publicCode: PUBLIC_CODE,
          lines: [
            { listItemId: 10, variantId: 2, quantity: 1 },
            { listItemId: 10, variantId: 2, quantity: 1 },
            { listItemId: 11, variantId: 0, quantity: 1 },
          ],
        },
        fake.db as unknown as DbTransaction,
      ),
    ).rejects.toMatchObject({ listItemIds: [10, 11] });
    const badQuantity = fakeDatabase([publishedList], [item]);
    await expect(
      calculateListQuote(
        { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 1000 }] },
        badQuantity.db as unknown as DbTransaction,
      ),
    ).rejects.toMatchObject({ listItemIds: [10] });
  });

  it('flags a selection whose variant is not in the active catalogue', async () => {
    const fake = fakeDatabase([publishedList], [item], [], []);
    await expect(
      calculateListQuote(
        { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 1 }] },
        fake.db as unknown as DbTransaction,
      ),
    ).rejects.toMatchObject({ listItemIds: [10] });
  });

  it('prices an eligible selection with its list attribution', async () => {
    const fake = fakeDatabase([publishedList], [item], [variant], []);
    const calculation = await calculateListQuote(
      { publicCode: PUBLIC_CODE, lines: [{ listItemId: 10, variantId: 2, quantity: 2 }] },
      fake.db as unknown as DbTransaction,
      new Date('2026-10-14T10:00:00Z'),
    );
    expect(calculation.attribution).toMatchObject({
      schoolSupplyListId: 1,
      schoolSupplyListPublicCode: PUBLIC_CODE,
      businessPartnerId: 3,
      listOfferBasisPoints: null,
    });
    expect(calculation.attribution.items.get(10)).toEqual({ defaultVariantId: 2, exactItem: true });
    expect(calculation.quote.lines).toEqual([
      expect.objectContaining({ variantId: 2, quantity: 2 }),
    ]);
    expect(calculation.variantMap.get(2)).toMatchObject({ productId: 4, sku: 'PEN-BLUE' });
  });
});
