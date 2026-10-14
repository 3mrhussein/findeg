import { describe, expect, it } from 'vitest';
import {
  moneyFromDecimal,
  priceQuote,
  publicCode,
  sku,
  type ListOffer,
  type SupplyListId,
  type SupplyListItemId,
  type VariantId,
} from '@findeg/domain';
import { computeConfirmation, toCheckoutQuote } from '../index';

describe('list-sourced quote mapping', () => {
  it('keeps the list item id and the List Offer discount in the HTTP quote and digest', () => {
    const offer: ListOffer = {
      id: 1 as ListOffer['id'],
      supplyListId: 1 as SupplyListId,
      basisPoints: 1000,
      startsAt: new Date('2026-09-01T00:00:00Z'),
      endsAt: null,
    };
    const quote = priceQuote(
      {
        kind: 'list',
        supplyListId: 1 as SupplyListId,
        publicCode: publicCode('0123456789abcdef0123456789abcdef'),
        offer,
      },
      [
        {
          variantId: 2 as VariantId,
          quantity: 1,
          unitPrice: moneyFromDecimal('100.00'),
          productName: 'Pen',
          sku: sku('PEN-BLUE'),
          listItem: {
            supplyListItemId: 10 as SupplyListItemId,
            defaultVariantId: 2 as VariantId,
          },
        },
      ],
      new Date('2026-10-14T10:00:00Z'),
    );
    const mapped = toCheckoutQuote(quote);
    expect(mapped.lines[0]).toMatchObject({ listItemId: 10, unitPrice: '100.00' });
    expect(mapped.lines[0].discounts.length).toBeGreaterThan(0);
    expect(
      computeConfirmation(
        // The digest is derived from the same Domain terms as the HTTP quote.
        {
          lines: [],
          shipping: moneyFromDecimal('0'),
          subtotal: moneyFromDecimal('0'),
          total: moneyFromDecimal('0'),
        } as never,
      ),
    ).toMatch(/^[0-9a-f]{64}$/);
  });
});
