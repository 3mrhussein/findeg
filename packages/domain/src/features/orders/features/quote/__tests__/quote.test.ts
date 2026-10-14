import { describe, expect, it } from 'vitest';
import { sku, type VariantId } from '@findeg/domain';
import { DomainError, moneyFromDecimal, moneyToDecimal } from '@findeg/domain';
import {
  FLAT_SHIPPING_FEE,
  priceQuote,
  type Quote,
  type QuoteLineRequest,
  type QuoteSource,
} from '@findeg/domain';
import { publicCode, type SupplyListId, type SupplyListItemId } from '@findeg/domain';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return (error as DomainError).code;
    throw error;
  }
}

const OFFER_STARTS = new Date('2026-10-01T00:00:00.000Z');
const OFFER_ENDS = new Date('2026-11-01T00:00:00.000Z');
const AT = new Date('2026-10-15T12:00:00.000Z');

const CART: QuoteSource = { kind: 'cart' };
/** A list whose offer of `basisPoints` runs through October, or a list with no offer. */
function list(basisPoints: number | null): QuoteSource {
  return {
    kind: 'list',
    supplyListId: 7 as SupplyListId,
    publicCode: publicCode('a'.repeat(32)),
    offer:
      basisPoints === null ? null : { basisPoints, startsAt: OFFER_STARTS, endsAt: OFFER_ENDS },
  };
}

/** A Quote priced mid-October unless another moment is given. */
function quoteAt(source: QuoteSource, lines: QuoteLineRequest[], at = AT): Quote {
  return priceQuote(source, lines, at);
}

function cartLine(variantId: number, price: string, quantity: number): QuoteLineRequest {
  return {
    variantId: variantId as VariantId,
    productName: `Product ${String(variantId)}`,
    sku: sku(`SKU-${String(variantId)}`),
    unitPrice: moneyFromDecimal(price),
    quantity,
  };
}

/** A list line; a substitute's item defaults to another variant. */
function listLine(
  itemId: number,
  variantId: number,
  price: string,
  quantity: number,
  substitute = false,
): QuoteLineRequest {
  return {
    ...cartLine(variantId, price, quantity),
    listItem: {
      supplyListItemId: itemId as SupplyListItemId,
      defaultVariantId: (substitute ? variantId + 100 : variantId) as VariantId,
    },
  };
}

/** The Quote's amounts as `xx.xx` text, as checkout stores them. */
function amounts(quote: Quote) {
  return {
    lines: quote.lines.map((line) => ({
      unitPrice: moneyToDecimal(line.unitPrice),
      discounts: line.discounts.map((d) => [d.source, moneyToDecimal(d.amount)]),
      lineTotal: moneyToDecimal(line.lineTotal),
    })),
    netSubtotal: moneyToDecimal(quote.totals.netSubtotal),
    discount: moneyToDecimal(quote.totals.discount),
    grossSubtotal: moneyToDecimal(quote.totals.grossSubtotal),
    shipping: moneyToDecimal(quote.totals.shipping),
    total: moneyToDecimal(quote.totals.total),
  };
}

// Ported from checkout's Quote tests (the validate seam and the integer-piaster suite). Totals
// must match today's exactly; only the shipping fee is now always the flat 50.00.
describe('Quote pricing', () => {
  it('prices a cart Quote line by line, plus shipping', () => {
    const quote = quoteAt(CART, [cartLine(1, '40.00', 2), cartLine(2, '15.00', 3)]);
    expect(quote.currency).toBe('EGP');
    expect(amounts(quote)).toEqual({
      lines: [
        { unitPrice: '40.00', discounts: [], lineTotal: '80.00' },
        { unitPrice: '15.00', discounts: [], lineTotal: '45.00' },
      ],
      netSubtotal: '125.00',
      discount: '0.00',
      grossSubtotal: '125.00',
      shipping: '50.00',
      total: '175.00',
    });
  });

  it('sums float-hostile cart amounts exactly', () => {
    const quote = quoteAt(CART, [
      cartLine(1, '0.10', 3),
      cartLine(2, '0.20', 7),
      cartLine(3, '19.99', 13),
    ]);
    expect(amounts(quote).lines.map((line) => line.lineTotal)).toEqual(['0.30', '1.40', '259.87']);
    expect(amounts(quote)).toMatchObject({ netSubtotal: '261.57', total: '311.57' });

    const tenths = quoteAt(
      CART,
      Array.from({ length: 12 }, (_, i) => cartLine(i + 1, '0.10', 1)),
    );
    expect(amounts(tenths)).toMatchObject({ netSubtotal: '1.20', total: '51.20' });
  });

  it('merges repeated cart variants, in the order they first appear', () => {
    const quote = quoteAt(CART, [
      cartLine(5, '1.00', 1),
      cartLine(2, '3.00', 1),
      cartLine(5, '1.00', 2),
    ]);
    expect(quote.lines.map((line) => [line.variantId, line.quantity])).toEqual([
      [5, 3],
      [2, 1],
    ]);
    expect(moneyToDecimal(quote.totals.netSubtotal)).toBe('6.00');
  });

  it('prices a List Offer per line, rounding half up once per line, tagged list-offer', () => {
    const quote = quoteAt(list(1000), [listLine(1, 1, '10.05', 1), listLine(2, 2, '3.33', 3)]);
    // 1005 x 0.9 = 904.5 -> 905 (half rounds up); 999 x 0.9 = 899.1 -> 899
    expect(amounts(quote)).toEqual({
      lines: [
        { unitPrice: '10.05', discounts: [['list-offer', '1.00']], lineTotal: '9.05' },
        { unitPrice: '3.33', discounts: [['list-offer', '1.00']], lineTotal: '8.99' },
      ],
      netSubtotal: '18.04',
      discount: '2.00',
      grossSubtotal: '20.04',
      shipping: '50.00',
      total: '68.04',
    });
  });

  it('rounds exact half piasters up, and 0 and 10000 basis points to the extremes', () => {
    const line = (bps: number) => amounts(quoteAt(list(bps), [listLine(1, 1, '0.03', 1)])).lines[0];
    expect(line(5000)).toMatchObject({ lineTotal: '0.02' });
    expect(line(0)).toEqual({ unitPrice: '0.03', discounts: [], lineTotal: '0.03' });
    expect(line(10000)).toEqual({
      unitPrice: '0.03',
      discounts: [['list-offer', '0.03']],
      lineTotal: '0.00',
    });
  });

  it('prices a list with no active offer at gross', () => {
    expect(amounts(quoteAt(list(null), [listLine(1, 1, '100.00', 1)]))).toMatchObject({
      lines: [{ discounts: [], lineTotal: '100.00' }],
      total: '150.00',
    });
  });

  it('records exact list amounts with an offer: gross, discount and net add up', () => {
    const quote = quoteAt(list(1000), [
      listLine(1, 1, '10.05', 3),
      listLine(2, 2, '0.10', 3),
      listLine(3, 3, '0.20', 3),
    ]);
    // 3015 x 0.9 = 2713.5 -> 2714; 30 x 0.9 = 27; 60 x 0.9 = 54 => 2795 piasters
    expect(amounts(quote)).toEqual({
      lines: [
        { unitPrice: '10.05', discounts: [['list-offer', '3.01']], lineTotal: '27.14' },
        { unitPrice: '0.10', discounts: [['list-offer', '0.03']], lineTotal: '0.27' },
        { unitPrice: '0.20', discounts: [['list-offer', '0.06']], lineTotal: '0.54' },
      ],
      netSubtotal: '27.95',
      discount: '3.10',
      grossSubtotal: '31.05',
      shipping: '50.00',
      total: '77.95',
    });
  });

  it('applies the offer to every line, Exact Item or substitute', () => {
    const quote = quoteAt(list(1000), [
      listLine(1, 1, '20.00', 1, false),
      listLine(2, 2, '30.00', 1, true),
    ]);
    expect(amounts(quote).lines.map((line) => line.lineTotal)).toEqual(['18.00', '27.00']);
    expect(quote.lines.map((line) => line.discounts[0].source)).toEqual([
      'list-offer',
      'list-offer',
    ]);
    expect(quote.lines.map((line) => line.isSubstitute)).toEqual([false, true]);
  });

  it('orders list lines by list item', () => {
    const quote = quoteAt(list(null), [listLine(9, 1, '1.00', 1), listLine(3, 2, '1.00', 1)]);
    expect(quote.lines.map((line) => line.supplyListItemId)).toEqual([3, 9]);
  });

  it('keeps each line snapshot: name, SKU and, on cart lines, no list item', () => {
    const [line] = quoteAt(CART, [cartLine(4, '2.50', 2)]).lines;
    expect(line).toMatchObject({
      variantId: 4,
      productName: 'Product 4',
      sku: 'SKU-4',
      quantity: 2,
      supplyListItemId: null,
      isSubstitute: null,
    });
  });

  it('change: shipping is always the flat 50.00 fee', () => {
    expect(moneyToDecimal(FLAT_SHIPPING_FEE)).toBe('50.00');
    expect(quoteAt(CART, [cartLine(1, '1.10', 1)]).totals.shipping).toBe(FLAT_SHIPPING_FEE);
    expect(quoteAt(list(2500), [listLine(1, 1, '1.10', 1)]).totals.shipping).toBe(
      FLAT_SHIPPING_FEE,
    );
  });

  it('refuses an offer outside 0 to 10000 basis points', () => {
    expect(codeOf(() => quoteAt(list(10001), [listLine(1, 1, '1.00', 1)]))).toBe(
      'INVALID_BASIS_POINTS',
    );
  });

  it.each([[0], [-1], [1.5]])('refuses a line of %s units', (quantity) => {
    expect(codeOf(() => quoteAt(CART, [cartLine(1, '1.00', quantity)]))).toBe(
      'INVALID_LINE_QUANTITY',
    );
  });

  // Rule change (spec #402): today an Order line has no upper bound. An Order comes from the
  // Cart or from one list, and both hold at most 999 units a line, so an Order line does too.
  it('change: refuses an Order line above 999 units', () => {
    expect(quoteAt(CART, [cartLine(1, '1.00', 999)]).lines[0].quantity).toBe(999);
    expect(codeOf(() => quoteAt(CART, [cartLine(1, '1.00', 1000)]))).toBe('INVALID_LINE_QUANTITY');
    expect(codeOf(() => quoteAt(list(null), [listLine(1, 1, '1.00', 1000)]))).toBe(
      'INVALID_LINE_QUANTITY',
    );
    expect(codeOf(() => quoteAt(CART, [cartLine(1, '1.00', 600), cartLine(1, '1.00', 400)]))).toBe(
      'INVALID_LINE_QUANTITY',
    );
  });

  it('refuses a Quote with no lines', () => {
    expect(codeOf(() => quoteAt(CART, []))).toBe('EMPTY_ORDER');
    expect(codeOf(() => quoteAt(list(null), []))).toBe('EMPTY_ORDER');
  });
});

// The List Offer applies only inside its window, decided once for the whole Quote (ADR-0007).
describe('List Offer at the pricing moment', () => {
  const lines = () => [listLine(1, 1, '100.00', 1), listLine(2, 2, '20.00', 1, true)];
  const totalsAt = (at: Date) =>
    amounts(quoteAt(list(2500), lines(), at)).lines.map((line) => line.lineTotal);

  it('applies from its start, inclusive, to its end, exclusive, to every line alike', () => {
    expect(totalsAt(new Date(OFFER_STARTS.getTime() - 1))).toEqual(['100.00', '20.00']);
    expect(totalsAt(OFFER_STARTS)).toEqual(['75.00', '15.00']);
    expect(totalsAt(new Date(OFFER_ENDS.getTime() - 1))).toEqual(['75.00', '15.00']);
    expect(totalsAt(OFFER_ENDS)).toEqual(['100.00', '20.00']);
  });

  it('records the basis points that applied, or null, on the Quote source', () => {
    expect(quoteAt(list(2500), lines()).source).toEqual({
      kind: 'list',
      supplyListId: 7,
      publicCode: 'a'.repeat(32),
      listOfferBasisPoints: 2500,
    });
    expect(quoteAt(list(2500), lines(), OFFER_ENDS).source).toMatchObject({
      listOfferBasisPoints: null,
    });
    expect(quoteAt(list(null), lines()).source).toMatchObject({ listOfferBasisPoints: null });
  });

  it("flags a line as a substitute when its variant is not the item's default", () => {
    expect(quoteAt(list(null), lines()).lines.map((line) => line.isSubstitute)).toEqual([
      false,
      true,
    ]);
  });
});

// CO-1: an Order comes from the cart or from exactly one School Supply List, never both.
describe('Order source', () => {
  it('refuses a cart Quote holding a list line', () => {
    expect(codeOf(() => quoteAt(CART, [cartLine(1, '1.00', 1), listLine(1, 2, '1.00', 1)]))).toBe(
      'MIXED_ORDER_SOURCE',
    );
  });

  it('refuses a list Quote holding a cart line', () => {
    expect(
      codeOf(() => quoteAt(list(null), [listLine(1, 1, '1.00', 1), cartLine(2, '1.00', 1)])),
    ).toBe('MIXED_ORDER_SOURCE');
  });
});
