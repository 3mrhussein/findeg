import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { createStorefrontCommerce } from '../checkout.js';

const owner = 'a'.repeat(64);
const variant = {
  id: 11,
  sku: 'PEN-BLUE',
  name: { en: 'Blue Pen', ar: 'قلم أزرق' },
  label: { en: 'Blue', ar: 'أزرق' },
  price: '0.10',
  isActive: true,
};

function setup() {
  let items = [{ variantId: 11, quantity: 2 }];
  const outcomes = new Map<string, { fingerprint: string; order: any }>();
  const reservations: string[] = [];
  const stores = {
    commerce: {
      readCart: async () => items,
      replaceCart: async (_owner: string, next: typeof items) => { items = [...next]; },
      deliveryZones: async () => [{ id: 1, name: { en: 'Cairo', ar: 'القاهرة' }, fee: '20.00' }],
      deliveryZone: async () => ({ id: 1, name: { en: 'Cairo', ar: 'القاهرة' }, fee: '20.00' }),
      outcome: async (_owner: string, key: string) => outcomes.get(key),
      accept: async (_order: any, _owner: string, key: string, fingerprint: string) => {
        outcomes.set(key, { fingerprint, order: _order });
      },
      readOrder: async () => undefined,
    },
    catalog: { listActiveVariants: async () => [variant] },
    inventory: { availabilityFor: async () => new Map([[11, 2]]) },
    checkoutCatalog: { readEligible: async () => [variant] },
    reservations: { reserve: async (reference: string) => { reservations.push(reference); return true; } },
    outbox: { enqueue: async () => undefined },
  };
  const commerce = createStorefrontCommerce(
    { run: async (operation: any) => { const result = await operation(stores); return result.ok ? result : result; } },
    { digest: (value) => createHash('sha256').update(value).digest('hex'), randomToken: () => 'a'.repeat(64), verificationCode: () => '123456' },
  );
  return { commerce, reservations, getItems: () => items };
}

describe('Storefront Commerce checkout', () => {
  it('prices in exact EGP minor units and clears the ordinary Cart after acceptance', async () => {
    const { commerce, getItems, reservations } = setup();
    const quote = await commerce.quoteCheckout(owner, 1);
    expect(quote.status).toBe('quoted');
    if (quote.status !== 'quoted') return;
    expect(quote.total).toBe('20.20');
    const result = await commerce.acceptCheckout(owner, {
      key: 'checkout-request-1', confirmation: quote.confirmation,
      address: { name: 'Customer', email: 'customer@example.com', phone: '01012345678', street: 'Main', city: 'Cairo', zoneId: 1 },
      paymentMethod: 'cash-on-delivery', deliveryMethod: 'home-delivery',
    });
    expect(result).toEqual({ status: 'accepted', reference: 'a'.repeat(64), accessReference: 'a'.repeat(64), total: '20.20' });
    expect(getItems()).toEqual([]);
    expect(reservations).toEqual(['a'.repeat(64)]);
  });

  it('replays the saved outcome and rejects changed input under the same key', async () => {
    const { commerce } = setup();
    const quote = await commerce.quoteCheckout(owner, 1);
    if (quote.status !== 'quoted') throw new Error('expected quote');
    const input = {
      key: 'checkout-request-2', confirmation: quote.confirmation,
      address: { name: 'Customer', email: 'customer@example.com', phone: '01012345678', street: 'Main', city: 'Cairo', zoneId: 1 },
      paymentMethod: 'cash-on-delivery', deliveryMethod: 'home-delivery',
    };
    expect((await commerce.acceptCheckout(owner, input)).status).toBe('accepted');
    expect((await commerce.acceptCheckout(owner, input)).status).toBe('accepted');
    expect((await commerce.acceptCheckout(owner, { ...input, address: { ...input.address, street: 'Changed' } })).status).toBe('idempotency-conflict');
  });
});
