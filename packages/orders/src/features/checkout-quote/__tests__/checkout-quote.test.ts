import { describe, expect, it } from 'vitest';
import { moneyFromDecimal, priceQuote, sku, type VariantId } from '@findeg/domain';
import { computeConfirmation, toCheckoutQuote } from '../index';

const quoteFor = (unitPrice: string, quantity = 2) =>
  priceQuote(
    { kind: 'cart' },
    [
      {
        variantId: 1 as VariantId,
        sku: sku('PEN-BLUE'),
        productName: 'Pen',
        unitPrice: moneyFromDecimal(unitPrice),
        quantity,
      },
    ],
    new Date('2026-10-14T10:00:00Z'),
  );

describe('checkout quote mapping', () => {
  it('renders Domain Money as exact decimal strings with the EGP currency', () => {
    const quote = toCheckoutQuote(quoteFor('12.50', 2));
    expect(quote.lines).toEqual([
      expect.objectContaining({
        variantId: 1,
        quantity: 2,
        unitPrice: '12.50',
        lineTotal: '25.00',
      }),
    ]);
    expect(quote.subtotal).toBe('25.00');
    expect(quote.currency).toBe('EGP');
    expect(quote.confirmation).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('computeConfirmation', () => {
  it('is stable for identical terms and changes when the total changes', () => {
    const terms = {
      lines: [],
      shipping: moneyFromDecimal('50'),
      subtotal: moneyFromDecimal('25'),
      total: moneyFromDecimal('75'),
      currency: 'EGP',
    } as unknown as Parameters<typeof computeConfirmation>[0];
    const again = { ...terms };
    const repriced = { ...terms, total: moneyFromDecimal('76') };
    expect(computeConfirmation(terms)).toBe(computeConfirmation(again));
    expect(computeConfirmation(terms)).not.toBe(computeConfirmation(repriced));
  });
});
