import { describe, expect, it } from 'vitest';
import { sku, type VariantId } from '@findeg/domain/catalog';
import type { CustomerId } from '@findeg/domain/customers';
import { DomainError, moneyFromDecimal } from '@findeg/domain/common';
import type { StockBalance, Warehouse, WarehouseId } from '@findeg/domain/inventory';
import {
  acceptOrder,
  acceptedPaymentMethod,
  confirmationTerms,
  egyptianMobile,
  guestBuyer,
  orderReference,
  priceQuote,
  shippingAddress,
  type ConfirmationTerms,
  type OrderAcceptanceRequest,
  type QuoteSource,
  type Quote,
  type QuoteLineRequest,
} from '@findeg/domain/orders';
import { publicCode, type SupplyListId, type SupplyListItemId } from '@findeg/domain/school-lists';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return (error as DomainError).code;
    throw error;
  }
}

const egp = moneyFromDecimal;
const AT = new Date('2026-10-15T12:00:00.000Z');
const pen = 1 as VariantId;
const ruler = 2 as VariantId;
const main = 10 as WarehouseId;
const annex = 20 as WarehouseId;
const warehouses: Warehouse[] = [
  { id: main, name: 'Main', status: 'active' },
  { id: annex, name: 'Annex', status: 'active' },
];

function line(variantId: VariantId, price: string, quantity: number): QuoteLineRequest {
  return {
    variantId,
    productName: `Product ${String(variantId)}`,
    sku: sku(`SKU-${String(variantId)}`),
    unitPrice: egp(price),
    quantity,
  };
}

const digest = (terms: ConfirmationTerms) =>
  JSON.stringify(terms, (_key, value: unknown) =>
    typeof value === 'bigint' ? value.toString() : value,
  );

function request(
  quote: Quote,
  balances: StockBalance[],
  overrides: Partial<OrderAcceptanceRequest> = {},
): OrderAcceptanceRequest {
  return {
    reference: orderReference('FE-7K3Q9M'),
    buyer: guestBuyer('mona@example.com'),
    contactPhone: egyptianMobile('+201012345678'),
    shippingAddress: shippingAddress({
      fullName: 'Mona Adel',
      governorate: 'Cairo',
      city: 'Nasr City',
      area: 'District 7',
      street: 'Abbas El Akkad',
    }),
    paymentMethod: 'cod',
    quote,
    confirmation: digest(confirmationTerms(quote)),
    digestTerms: digest,
    stock: { balances, warehouses },
    ...overrides,
  };
}

const plenty: StockBalance[] = [
  { variantId: pen, warehouseId: main, onHand: 3, reserved: 0 },
  { variantId: pen, warehouseId: annex, onHand: 10, reserved: 0 },
  { variantId: ruler, warehouseId: main, onHand: 10, reserved: 2 },
];

// Ported from checkout's acceptance tests (CO-4, CO-10, ADR-0005).
describe('Order Acceptance', () => {
  const quote = priceQuote({ kind: 'cart' }, [line(pen, '40.00', 5), line(ruler, '15.00', 1)], AT);

  it('accepts a confirmed Quote as a pending, unpaid cash-on-delivery Order', () => {
    const { order } = acceptOrder(request(quote, plenty));
    expect(order).toMatchObject({
      reference: 'FE-7K3Q9M',
      buyer: { kind: 'guest', email: 'mona@example.com' },
      contactPhone: '+201012345678',
      shippingAddress: { governorate: 'Cairo', city: 'Nasr City' },
      source: { kind: 'cart' },
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
      currency: 'EGP',
    });
  });

  it('snapshots each line and the totals from the Quote', () => {
    const { order } = acceptOrder(request(quote, plenty));
    expect(order.lines).toEqual([
      {
        variantId: pen,
        productName: 'Product 1',
        sku: 'SKU-1',
        quantity: 5,
        unitPrice: egp('40.00'),
        discounts: [],
        lineTotal: egp('200.00'),
        supplyListItemId: null,
        isSubstitute: null,
      },
      {
        variantId: ruler,
        productName: 'Product 2',
        sku: 'SKU-2',
        quantity: 1,
        unitPrice: egp('15.00'),
        discounts: [],
        lineTotal: egp('15.00'),
        supplyListItemId: null,
        isSubstitute: null,
      },
    ]);
    expect(order.totals).toEqual({
      netSubtotal: egp('215.00'),
      discount: egp('0.00'),
      grossSubtotal: egp('215.00'),
      shipping: egp('50.00'),
      total: egp('265.00'),
    });
  });

  it('freezes the accepted Order, so its prices never change', () => {
    const { order } = acceptOrder(request(quote, plenty));
    expect(Object.isFrozen(order)).toBe(true);
    expect(Object.isFrozen(order.totals)).toBe(true);
    expect(Object.isFrozen(order.lines)).toBe(true);
    expect(() => {
      (order.lines[0] as { unitPrice: unknown }).unitPrice = egp('1.00');
    }).toThrow(TypeError);
    expect(order.lines[0].unitPrice).toBe(egp('40.00'));
  });

  it('holds stock for every line, greedily across active warehouses', () => {
    expect(acceptOrder(request(quote, plenty)).stock).toEqual([
      { variantId: pen, warehouseId: main, quantity: 3 },
      { variantId: pen, warehouseId: annex, quantity: 2 },
      { variantId: ruler, warehouseId: main, quantity: 1 },
    ]);
  });

  it('is all-or-nothing on stock: one short line refuses the whole Order', () => {
    const short: StockBalance[] = [
      { variantId: pen, warehouseId: main, onHand: 10, reserved: 0 },
      { variantId: ruler, warehouseId: main, onHand: 1, reserved: 1 },
    ];
    expect(codeOf(() => acceptOrder(request(quote, short)))).toBe('INSUFFICIENT_STOCK');
  });

  it('asks for reconfirmation when the terms changed, before holding any stock', () => {
    const repriced = priceQuote(
      { kind: 'cart' },
      [line(pen, '41.00', 5), line(ruler, '15.00', 1)],
      AT,
    );
    const stale = digest(confirmationTerms(quote));
    expect(codeOf(() => acceptOrder(request(repriced, [], { confirmation: stale })))).toBe(
      'RECONFIRMATION_REQUIRED',
    );
  });

  it('accepts only cash on delivery', () => {
    expect(codeOf(() => acceptOrder(request(quote, plenty, { paymentMethod: 'card' })))).toBe(
      'UNSUPPORTED_PAYMENT_METHOD',
    );
  });

  it('accepts a Customer account as the buyer', () => {
    const buyer = { kind: 'customer', customerId: 42 as CustomerId } as const;
    expect(acceptOrder(request(quote, plenty, { buyer })).order.buyer).toEqual(buyer);
  });

  it('change: an Order always has a guest email, or a Customer, and a contact phone', () => {
    expect(
      codeOf(() => acceptOrder(request(quote, plenty, { buyer: { kind: 'guest', email: '' } }))),
    ).toBe('INVALID_GUEST_EMAIL');
    expect(codeOf(() => acceptOrder(request(quote, plenty, { contactPhone: '' as never })))).toBe(
      'INVALID_PHONE',
    );
  });

  it('keeps a list Order attributed to its list, offer, items and substitutes', () => {
    const source: QuoteSource = {
      kind: 'list',
      supplyListId: 7 as SupplyListId,
      publicCode: publicCode('a'.repeat(32)),
      offer: { basisPoints: 1000, startsAt: new Date('2026-10-01T00:00:00.000Z'), endsAt: null },
    };
    const listQuote = priceQuote(
      source,
      [
        {
          ...line(pen, '10.05', 2),
          listItem: { supplyListItemId: 3 as SupplyListItemId, defaultVariantId: pen },
        },
        {
          ...line(ruler, '20.00', 1),
          listItem: { supplyListItemId: 4 as SupplyListItemId, defaultVariantId: pen },
        },
      ],
      AT,
    );
    const { order } = acceptOrder(request(listQuote, plenty));
    expect(order.source).toEqual({
      kind: 'list',
      supplyListId: 7,
      publicCode: 'a'.repeat(32),
      listOfferBasisPoints: 1000,
    });
    expect(order.lines.map((l) => [l.supplyListItemId, l.isSubstitute, l.discounts])).toEqual([
      [3, false, [{ source: 'list-offer', amount: egp('2.01') }]],
      [4, true, [{ source: 'list-offer', amount: egp('2.00') }]],
    ]);
    expect(order.totals).toMatchObject({ discount: egp('4.01'), grossSubtotal: egp('40.10') });
  });
});

describe('accepted payment methods', () => {
  it('cash on delivery is the only one', () => {
    expect(acceptedPaymentMethod('cod')).toBe('cod');
    expect(codeOf(() => acceptedPaymentMethod('card'))).toBe('UNSUPPORTED_PAYMENT_METHOD');
    expect(codeOf(() => acceptedPaymentMethod('cash'))).toBe('UNSUPPORTED_PAYMENT_METHOD');
  });
});
