import { describe, expect, it } from 'vitest';
import { piastersToDecimal } from '@findeg/money';
import { computeConfirmation } from './confirmation';
import { shippingFeeToPiasters, sumQuote } from './piasters';

describe('shippingFeeToPiasters', () => {
  it.each([
    [50, 5000n],
    ['50', 5000n],
    [49.99, 4999n],
    ['12.5', 1250n],
    [0, 0n],
  ])('converts %s', (fee, piasters) => {
    expect(shippingFeeToPiasters(fee)).toBe(piasters);
  });

  it.each([['abc'], [''], ['-5'], [-5], [NaN], [Infinity], [10.005], ['10.005'], ['1e2'], [1e21]])(
    'rejects %s instead of rounding it',
    (fee) => {
      expect(() => shippingFeeToPiasters(fee)).toThrow(/Invalid shipping fee/);
    },
  );
});

describe('sumQuote', () => {
  it('sums many lines exactly where float math diverges', () => {
    const lines = Array.from({ length: 10 }, (_, i) => ({
      variantId: i,
      quantity: 1,
      unitPrice: 10n,
      discounts: [],
      lineTotal: 10n, // 0.10 each; float 0.1 * 10 sums to 0.9999999999999999
    }));
    const sums = sumQuote(lines, 5000n);
    expect(sums).toEqual({ subtotal: 100n, shipping: 5000n, total: 5100n });
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(
      piastersToDecimal(
        sumQuote(
          [
            { ...lines[0]!, lineTotal: 10n },
            { ...lines[0]!, lineTotal: 20n },
          ],
          0n,
        ).total,
      ),
    ).toBe('0.30');
  });
});

describe('computeConfirmation stability', () => {
  // Digests captured from the number-based implementation, before Quotes became BigInt.
  it('keeps the List digest for unchanged terms', () => {
    const digest = computeConfirmation({
      source: 'list',
      publicCode: 'abc',
      listOfferBasisPoints: 1000,
      currency: 'EGP',
      shipping: 5000n,
      subtotal: 3344n,
      total: 8344n,
      lines: [
        {
          listItemId: 2,
          variantId: 5,
          quantity: 3,
          unitPrice: 1235n,
          discounts: [{ source: 'list-offer', amount: 371n }],
          lineTotal: 3334n,
        },
        { listItemId: 1, variantId: 4, quantity: 1, unitPrice: 10n, discounts: [], lineTotal: 10n },
      ],
    });
    expect(digest).toBe('4039eba447635e10a447a63faaf3da259a78a65fb63682f5ca0d0c080cef0657');
  });

  it('keeps the Cart digest for unchanged terms', () => {
    const digest = computeConfirmation({
      currency: 'EGP',
      shipping: 5000n,
      subtotal: 30n,
      total: 5030n,
      lines: [{ variantId: 4, quantity: 3, unitPrice: 10n, discounts: [], lineTotal: 30n }],
    });
    expect(digest).toBe('2ca722e54d0f300a87f7b0106433829197ecbc832dbd414abd500d5d307bb68b');
  });
});
