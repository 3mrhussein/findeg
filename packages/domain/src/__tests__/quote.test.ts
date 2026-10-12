import { describe, expect, it } from 'vitest';
import { sku, type VariantId } from '@findeg/domain/catalog';
import { DomainError, moneyFromDecimal, moneyToDecimal } from '@findeg/domain/common';
import {
  FLAT_SHIPPING_FEE,
  priceQuote,
  type OrderSource,
  type Quote,
  type QuoteLineRequest,
} from '@findeg/domain/orders';
import type { SupplyListId, SupplyListItemId } from '@findeg/domain/school-lists';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
}

const CART: OrderSource = { kind: 'cart' };
function list(listOfferBasisPoints: number | null): OrderSource {
  return {
    kind: 'list',
    supplyListId: 7 as SupplyListId,
    publicCode: 'a'.repeat(32),
    listOfferBasisPoints,
  };
}

function cartLine(variantId: number, price: string, quantity: number): QuoteLineRequest {
  return {
    variantId: variantId as VariantId,
    productName: `Product ${variantId}`,
    sku: sku(`SKU-${variantId}`),
    unitPrice: moneyFromDecimal(price),
    quantity,
  };
}

function listLine(
  itemId: number,
  variantId: number,
  price: string,
  quantity: number,
  isSubstitute = false,
): QuoteLineRequest {
  return {
    ...cartLine(variantId, price, quantity),
    listItem: { supplyListItemId: itemId as SupplyListItemId, isSubstitute },
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
    const quote = priceQuote(CART, [cartLine(1, '40.00', 2), cartLine(2, '15.00', 3)]);
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
    const quote = priceQuote(CART, [
      cartLine(1, '0.10', 3),
      cartLine(2, '0.20', 7),
      cartLine(3, '19.99', 13),
    ]);
    expect(amounts(quote).lines.map((line) => line.lineTotal)).toEqual(['0.30', '1.40', '259.87']);
    expect(amounts(quote)).toMatchObject({ netSubtotal: '261.57', total: '311.57' });

    const tenths = priceQuote(
      CART,
      Array.from({ length: 12 }, (_, i) => cartLine(i + 1, '0.10', 1)),
    );
    expect(amounts(tenths)).toMatchObject({ netSubtotal: '1.20', total: '51.20' });
  });

  it('merges repeated cart variants, in the order they first appear', () => {
    const quote = priceQuote(CART, [
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
    const quote = priceQuote(list(1000), [listLine(1, 1, '10.05', 1), listLine(2, 2, '3.33', 3)]);
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
    const line = (bps: number) =>
      amounts(priceQuote(list(bps), [listLine(1, 1, '0.03', 1)])).lines[0];
    expect(line(5000)).toMatchObject({ lineTotal: '0.02' });
    expect(line(0)).toEqual({ unitPrice: '0.03', discounts: [], lineTotal: '0.03' });
    expect(line(10000)).toEqual({
      unitPrice: '0.03',
      discounts: [['list-offer', '0.03']],
      lineTotal: '0.00',
    });
  });

  it('prices a list with no active offer at gross', () => {
    expect(amounts(priceQuote(list(null), [listLine(1, 1, '100.00', 1)]))).toMatchObject({
      lines: [{ discounts: [], lineTotal: '100.00' }],
      total: '150.00',
    });
  });

  it('records exact list amounts with an offer: gross, discount and net add up', () => {
    const quote = priceQuote(list(1000), [
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
    const quote = priceQuote(list(1000), [
      listLine(1, 1, '20.00', 1, false),
      listLine(2, 2, '30.00', 1, true),
    ]);
    expect(amounts(quote).lines.map((line) => line.lineTotal)).toEqual(['18.00', '27.00']);
    expect(quote.lines.every((line) => line.discounts[0]?.source === 'list-offer')).toBe(true);
    expect(quote.lines.map((line) => line.isSubstitute)).toEqual([false, true]);
  });

  it('orders list lines by list item', () => {
    const quote = priceQuote(list(null), [listLine(9, 1, '1.00', 1), listLine(3, 2, '1.00', 1)]);
    expect(quote.lines.map((line) => line.supplyListItemId)).toEqual([3, 9]);
  });

  it('keeps each line snapshot: name, SKU and, on cart lines, no list item', () => {
    const [line] = priceQuote(CART, [cartLine(4, '2.50', 2)]).lines;
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
    expect(priceQuote(CART, [cartLine(1, '1.10', 1)]).totals.shipping).toBe(FLAT_SHIPPING_FEE);
    expect(priceQuote(list(2500), [listLine(1, 1, '1.10', 1)]).totals.shipping).toBe(
      FLAT_SHIPPING_FEE,
    );
  });

  it('refuses an offer outside 0 to 10000 basis points', () => {
    expect(codeOf(() => priceQuote(list(10001), [listLine(1, 1, '1.00', 1)]))).toBe(
      'INVALID_BASIS_POINTS',
    );
  });

  it.each([[0], [-1], [1.5]])('refuses a line of %s units', (quantity) => {
    expect(codeOf(() => priceQuote(CART, [cartLine(1, '1.00', quantity)]))).toBe(
      'INVALID_LINE_QUANTITY',
    );
  });

  it('refuses a Quote with no lines', () => {
    expect(codeOf(() => priceQuote(CART, []))).toBe('EMPTY_ORDER');
    expect(codeOf(() => priceQuote(list(null), []))).toBe('EMPTY_ORDER');
  });
});

// CO-1: an Order comes from the cart or from exactly one School Supply List, never both.
describe('Order source', () => {
  it('refuses a cart Quote holding a list line', () => {
    expect(
      codeOf(() => priceQuote(CART, [cartLine(1, '1.00', 1), listLine(1, 2, '1.00', 1)])),
    ).toBe('MIXED_ORDER_SOURCE');
  });

  it('refuses a list Quote holding a cart line', () => {
    expect(
      codeOf(() => priceQuote(list(null), [listLine(1, 1, '1.00', 1), cartLine(2, '1.00', 1)])),
    ).toBe('MIXED_ORDER_SOURCE');
  });
});
