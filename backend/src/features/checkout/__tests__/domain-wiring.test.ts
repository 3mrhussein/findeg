import { describe, expect, it, vi } from 'vitest';
import { moneyFromDecimal, moneyToDecimal } from '@findeg/domain';
import { sku, type VariantId } from '@findeg/domain';
import {
  confirmQuote,
  confirmationTerms,
  priceQuote,
  ReconfirmationRequiredError,
} from '@findeg/domain';
import { InsufficientStockError } from '@findeg/domain';
import { toCheckoutQuote } from '../application/quote-mapping';
import { mapDomainError } from '../application/domain-error';
import { computeConfirmation } from '../domain/confirmation';
import { CheckoutService } from '../application/services/CheckoutService';

const line = (variantId: number, unitPrice: string, quantity = 1) => ({
  variantId: variantId as VariantId,
  sku: sku(`SKU-${variantId}`),
  productName: 'Pen',
  unitPrice: moneyFromDecimal(unitPrice),
  quantity,
});

describe('Checkout domain wiring', () => {
  it('maps HTTP amounts exactly and rehydrates catalog decimals without float arithmetic', () => {
    const quote = priceQuote(
      { kind: 'cart' },
      [line(1, '90071992547409.91'), line(2, '0.10', 3)],
      new Date(),
    );
    const response = toCheckoutQuote(quote);
    expect(response).toMatchObject({
      subtotal: '90071992547410.21',
      shipping: '50.00',
      total: '90071992547460.21',
    });
    expect(moneyFromDecimal(response.total)).toBe(quote.totals.total);
    expect(JSON.parse(JSON.stringify(response))).toEqual(response);
  });

  it('uses Domain canonical terms for same terms and reconfirmation', () => {
    const quote = priceQuote({ kind: 'cart' }, [line(2, '0.20'), line(1, '0.10')], new Date());
    const same = priceQuote({ kind: 'cart' }, [line(1, '0.10'), line(2, '0.20')], new Date());
    const digest = computeConfirmation(confirmationTerms(quote));
    expect(confirmQuote(same, digest, computeConfirmation)).toBe(same);
    const changed = priceQuote({ kind: 'cart' }, [line(1, '0.11'), line(2, '0.20')], new Date());
    expect(() => confirmQuote(changed, digest, computeConfirmation)).toThrow(
      ReconfirmationRequiredError,
    );
    expect(mapDomainError(new ReconfirmationRequiredError(changed))).toMatchObject({
      success: false,
      status: 409,
      error: { code: 'reconfirmation-required', quote: { subtotal: '0.31' } },
    });
    expect(
      mapDomainError(
        new InsufficientStockError([{ variantId: 1 as VariantId, requested: 2, available: 1 }]),
      ),
    ).toMatchObject({
      status: 409,
      error: {
        code: 'insufficient-stock',
        shortfalls: [{ variantId: 1, requested: 2, available: 1 }],
      },
    });
  });

  it('ignores even malformed environment shipping overrides', () => {
    vi.stubEnv('CHECKOUT_FLAT_SHIPPING_FEE', '1.005');
    try {
      expect(() => new CheckoutService()).not.toThrow();
      expect(
        moneyToDecimal(priceQuote({ kind: 'cart' }, [line(1, '1.00')], new Date()).totals.shipping),
      ).toBe('50.00');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('refuses merged overflow at the command boundary before storage', async () => {
    const service = new CheckoutService();
    const lines = [
      { variantId: 1, quantity: 998 },
      { variantId: 1, quantity: 2 },
    ];
    expect(await service.validate({ source: 'cart', lines })).toMatchObject({
      status: 400,
      error: { code: 'validation-error' },
    });
    expect(
      await service.accept(
        {
          source: 'cart',
          lines,
          confirmation: 'unused',
          paymentMethod: 'cod',
          guestEmail: 'guest@example.com',
          address: {
            fullName: 'Customer',
            phone: '01012345678',
            city: 'Cairo',
            area: 'Nasr City',
            street: 'Street',
          },
        },
        { idempotencyKey: 'overflow' },
      ),
    ).toMatchObject({ status: 400, error: { code: 'validation-error' } });
  });
});
