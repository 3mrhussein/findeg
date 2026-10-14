import { describe, expect, it } from 'vitest';
import { sku, type VariantId } from '@findeg/domain';
import { DomainError, moneyFromDecimal } from '@findeg/domain';
import {
  ReconfirmationRequiredError,
  confirmQuote,
  confirmationTerms,
  priceQuote as priceQuoteAt,
  type ConfirmationTerms,
  type Quote,
  type QuoteLineRequest,
  type QuoteSource,
} from '@findeg/domain';
import { publicCode, type SupplyListId, type SupplyListItemId } from '@findeg/domain';

const egp = moneyFromDecimal;
const PUBLIC_CODE = 'abc'.padEnd(32, '0');
const AT = new Date('2026-10-15T12:00:00.000Z');
const CART: QuoteSource = { kind: 'cart' };
const list = (basisPoints: number | null): QuoteSource => ({
  kind: 'list',
  supplyListId: 7 as SupplyListId,
  publicCode: publicCode(PUBLIC_CODE),
  offer:
    basisPoints === null
      ? null
      : { basisPoints, startsAt: new Date('2026-10-01T00:00:00.000Z'), endsAt: null },
});
const priceQuote = (source: QuoteSource, lines: QuoteLineRequest[]): Quote =>
  priceQuoteAt(source, lines, AT);

function line(
  variantId: number,
  price: string,
  quantity: number,
  itemId?: number,
): QuoteLineRequest {
  return {
    variantId: variantId as VariantId,
    productName: `Product ${String(variantId)}`,
    sku: sku(`SKU-${String(variantId)}`),
    unitPrice: egp(price),
    quantity,
    ...(itemId === undefined
      ? {}
      : {
          listItem: {
            supplyListItemId: itemId as SupplyListItemId,
            defaultVariantId: variantId as VariantId,
          },
        }),
  };
}

/** Checkout hashes the terms; any deterministic digest stands in for it here. */
const digest = (terms: ConfirmationTerms) =>
  JSON.stringify(terms, (_key, value: unknown) =>
    typeof value === 'bigint' ? value.toString() : value,
  );

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return (error as DomainError).code;
    throw error;
  }
}

// Ported from checkout's confirmation tests: the terms are what the digest covers, normalised
// so line order does not matter.
describe('Confirmation terms', () => {
  it('are a list Order lines, per-line discounts, offer, source and public code, money and currency', () => {
    const quote = priceQuote(list(1000), [line(5, '12.35', 3, 2), line(4, '0.10', 1, 1)]);
    expect(confirmationTerms(quote)).toEqual({
      source: 'list',
      publicCode: PUBLIC_CODE,
      listOfferBasisPoints: 1000,
      currency: 'EGP',
      shipping: egp('50.00'),
      subtotal: egp('33.44'),
      total: egp('83.44'),
      lines: [
        {
          supplyListItemId: 1,
          variantId: 4,
          quantity: 1,
          unitPrice: egp('0.10'),
          discounts: [{ source: 'list-offer', amount: egp('0.01') }],
          lineTotal: egp('0.09'),
        },
        {
          supplyListItemId: 2,
          variantId: 5,
          quantity: 3,
          unitPrice: egp('12.35'),
          discounts: [{ source: 'list-offer', amount: egp('3.70') }],
          lineTotal: egp('33.35'),
        },
      ],
    });
  });

  it('carry no list source, public code or offer for a cart Order', () => {
    const terms = confirmationTerms(priceQuote(CART, [line(4, '0.10', 3)]));
    expect(terms).toEqual({
      source: 'cart',
      currency: 'EGP',
      shipping: egp('50.00'),
      subtotal: egp('0.30'),
      total: egp('50.30'),
      lines: [
        {
          variantId: 4,
          quantity: 3,
          unitPrice: egp('0.10'),
          discounts: [],
          lineTotal: egp('0.30'),
        },
      ],
    });
    expect(terms).not.toHaveProperty('publicCode');
    expect(terms).not.toHaveProperty('listOfferBasisPoints');
  });

  it('do not depend on the order lines were given in', () => {
    const a = priceQuote(CART, [line(1, '30.00', 1), line(2, '20.00', 2)]);
    const b = priceQuote(CART, [line(2, '20.00', 2), line(1, '30.00', 1)]);
    expect(confirmationTerms(a)).toEqual(confirmationTerms(b));
  });

  it('leave out names, SKUs and the substitute flag, which are not prices', () => {
    const before = priceQuote(CART, [line(1, '30.00', 1)]);
    const renamed = priceQuote(CART, [
      { ...line(1, '30.00', 1), productName: 'New name', sku: sku('NEW') },
    ]);
    expect(confirmationTerms(renamed)).toEqual(confirmationTerms(before));
  });
});

// CO-3: an Order is accepted only on the terms the Customer confirmed; otherwise they reconfirm.
describe('same terms or reconfirm', () => {
  const confirmed = priceQuote(list(1000), [line(1, '100.00', 1, 1)]);
  const confirmation = digest(confirmationTerms(confirmed));

  it('accepts a Quote whose terms are unchanged', () => {
    const fresh = priceQuote(list(1000), [line(1, '100.00', 1, 1)]);
    expect(confirmQuote(fresh, confirmation, digest)).toBe(fresh);
  });

  it.each([
    ['the price changed', priceQuote(list(1000), [line(1, '101.00', 1, 1)])],
    ['the quantity changed', priceQuote(list(1000), [line(1, '100.00', 2, 1)])],
    ['the offer changed', priceQuote(list(1500), [line(1, '100.00', 1, 1)])],
    ['the offer ended', priceQuote(list(null), [line(1, '100.00', 1, 1)])],
    ['another list item was chosen', priceQuote(list(1000), [line(1, '100.00', 1, 2)])],
    ['the source changed', priceQuote(CART, [line(1, '90.00', 1)])],
  ])('asks for reconfirmation when %s, with the fresh Quote', (_name, fresh) => {
    expect(codeOf(() => confirmQuote(fresh, confirmation, digest))).toBe('RECONFIRMATION_REQUIRED');
    try {
      confirmQuote(fresh, confirmation, digest);
    } catch (error) {
      expect(error).toBeInstanceOf(ReconfirmationRequiredError);
      expect((error as ReconfirmationRequiredError).quote).toBe(fresh);
    }
  });
});
