import { describe, expect, it } from 'vitest';
import { createCommerce } from '../public.js';

describe('Commerce guest checkout', () => {
  it('accepts a valid cash-on-delivery guest order and freezes the quoted price', async () => {
    const orders = new Map<string, any>();
    const guestOrders = new Map<string, any>();
    const catalog = {
      listActiveVariants: async () => [
        {
          id: 11,
          sku: 'PEN-BLUE',
          name: 'Blue Pen',
          label: 'Blue',
          price: '15.50',
          strikePrice: undefined,
          isActive: true,
        },
      ],
    };
    const inventory = {
      availabilityFor: async () => new Map([[11, 12]]),
    };
    const store = {
      findOrderByIdempotencyKey: async (key: string) => orders.get(key),
      storeOrder: async (record: any) => {
        orders.set(record.idempotencyKey, record);
        guestOrders.set(record.guestAccess.reference, record);
        return record;
      },
      findOrderByReference: async (reference: string) => guestOrders.get(reference),
      consumeGuestAccess: async (reference: string, verificationCode: string) => {
        const order = guestOrders.get(reference);
        if (!order) return false;
        if (order.guestAccess.verificationCode !== verificationCode || order.guestAccess.used)
          return false;
        order.guestAccess.used = true;
        return true;
      },
    };
    const commerce = createCommerce(store as any, catalog as any, inventory as any, {
      reference: () => 'ref_1234567890',
      verificationCode: () => '741212',
      now: () => new Date('2026-01-01T00:00:00Z'),
    });

    const result = await commerce.acceptGuestCashOnDeliveryOrder({
      idempotencyKey: 'checkout-1',
      email: 'guest@example.com',
      customer: {
        fullName: 'Guest Shopper',
        phone: '+966500000000',
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      shippingAddress: {
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      items: [{ variantId: 11, quantity: 2 }],
      paymentMethod: 'cod',
    });

    expect(result.status).toBe('accepted');
    if (result.status !== 'accepted') return;
    expect(result.order.items[0].unitPrice).toBe('15.50');
    expect(result.order.items[0].total).toBe('31.00');
    expect(result.order.total).toBe('31.00');
    expect(result.order.guestAccess.reference).toBe('ref_1234567890');
    expect(result.order.reservation.status).toBe('reserved');
  });

  it('replays the saved outcome for the same idempotency key and rejects changed input', async () => {
    const orders = new Map<string, any>();
    const catalog = {
      listActiveVariants: async () => [
        {
          id: 11,
          sku: 'PEN-BLUE',
          name: 'Blue Pen',
          label: 'Blue',
          price: '15.50',
          isActive: true,
        },
      ],
    };
    const inventory = {
      availabilityFor: async () => new Map([[11, 12]]),
    };
    const store = {
      findOrderByIdempotencyKey: async (key: string) => orders.get(key),
      storeOrder: async (record: any) => {
        orders.set(record.idempotencyKey, record);
        return record;
      },
      findOrderByReference: async () => undefined,
      consumeGuestAccess: async () => false,
    };
    const commerce = createCommerce(store as any, catalog as any, inventory as any, {
      reference: () => 'ref_same',
      verificationCode: () => '111111',
      now: () => new Date('2026-01-01T00:00:00Z'),
    });

    const first = await commerce.acceptGuestCashOnDeliveryOrder({
      idempotencyKey: 'checkout-same',
      email: 'guest@example.com',
      customer: {
        fullName: 'Guest Shopper',
        phone: '+966500000000',
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      shippingAddress: {
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      items: [{ variantId: 11, quantity: 1 }],
      paymentMethod: 'cod',
    });
    expect(first.status).toBe('accepted');

    const replay = await commerce.acceptGuestCashOnDeliveryOrder({
      idempotencyKey: 'checkout-same',
      email: 'guest@example.com',
      customer: {
        fullName: 'Guest Shopper',
        phone: '+966500000000',
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      shippingAddress: {
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      items: [{ variantId: 11, quantity: 1 }],
      paymentMethod: 'cod',
    });
    expect(replay.status).toBe('replayed');

    const mismatch = await commerce.acceptGuestCashOnDeliveryOrder({
      idempotencyKey: 'checkout-same',
      email: 'guest@example.com',
      customer: {
        fullName: 'Guest Shopper',
        phone: '+966500000000',
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      shippingAddress: {
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      items: [{ variantId: 11, quantity: 2 }],
      paymentMethod: 'cod',
    });
    expect(mismatch.status).toBe('idempotency-mismatch');
  });

  it('requires an opaque reference and verifies guest access only once', async () => {
    const orders = new Map<string, any>();
    const guestOrders = new Map<string, any>();
    const catalog = {
      listActiveVariants: async () => [
        {
          id: 7,
          sku: 'ERASER',
          name: 'Eraser',
          label: 'Small',
          price: '8.00',
          isActive: true,
        },
      ],
    };
    const inventory = {
      availabilityFor: async () => new Map([[7, 5]]),
    };
    const store = {
      findOrderByIdempotencyKey: async () => undefined,
      storeOrder: async (record: any) => {
        orders.set(record.idempotencyKey, record);
        guestOrders.set(record.guestAccess.reference, record);
        return record;
      },
      findOrderByReference: async (reference: string) => guestOrders.get(reference),
      consumeGuestAccess: async (reference: string, verificationCode: string) => {
        const order = guestOrders.get(reference);
        if (!order) return false;
        if (order.guestAccess.verificationCode !== verificationCode || order.guestAccess.used)
          return false;
        order.guestAccess.used = true;
        return true;
      },
    };
    const commerce = createCommerce(store as any, catalog as any, inventory as any, {
      reference: () => 'guest_ref_01',
      verificationCode: () => '444555',
      now: () => new Date('2026-01-01T00:00:00Z'),
    });

    const created = await commerce.acceptGuestCashOnDeliveryOrder({
      idempotencyKey: 'checkout-access',
      email: 'guest@example.com',
      customer: {
        fullName: 'Guest Shopper',
        phone: '+966500000000',
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      shippingAddress: {
        city: 'Cairo',
        area: 'Dokki',
        street: 'Main St',
      },
      items: [{ variantId: 7, quantity: 1 }],
      paymentMethod: 'cod',
    });
    expect(created.status).toBe('accepted');
    if (created.status !== 'accepted') return;

    const access = await commerce.readGuestOrder(created.order.guestAccess.reference);
    expect(access.status).toBe('verification-required');

    const verified = await commerce.verifyGuestOrderAccess(
      created.order.guestAccess.reference,
      created.order.guestAccess.verificationCode,
    );
    expect(verified.status).toBe('verified');

    const used = await commerce.verifyGuestOrderAccess(
      created.order.guestAccess.reference,
      created.order.guestAccess.verificationCode,
    );
    expect(used.status).toBe('verification-used');
  });
});
