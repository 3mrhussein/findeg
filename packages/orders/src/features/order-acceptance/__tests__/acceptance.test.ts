import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  catalog: vi.fn(),
  transaction: vi.fn(),
  find: vi.fn(),
  claim: vi.fn(),
  create: vi.fn(),
  lock: vi.fn(),
  persist: vi.fn(),
  record: vi.fn(),
  enqueue: vi.fn(),
}));

vi.mock('@findeg/db/connection', () => ({
  db: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: () => {
              const rows = storage.catalog();
              return {
                then: (resolve: (rows: unknown) => unknown) => Promise.resolve(rows).then(resolve),
                for: () => rows,
              };
            },
          }),
        }),
      }),
    }),
    transaction: storage.transaction,
  },
}));
vi.mock('@findeg/db/queries', () => ({
  orderQueries: { create: storage.create, isOrderReferenceConflict: () => false },
  checkoutIdempotencyQueries: {
    findByScopeAndKey: storage.find,
    claimKey: storage.claim,
    recordSuccess: storage.record,
    isScopeKeyConflict: () => false,
  },
  lockOrderStock: storage.lock,
  persistOrderStock: storage.persist,
  reserveOrderStock: vi.fn(),
  InsufficientStockError: class extends Error {},
}));

import { db } from '@findeg/db/connection';
import { CheckoutService } from '../helpers';

const address = {
  fullName: 'Customer Name',
  phone: '01012345678',
  city: 'Cairo',
  area: 'Nasr City',
  street: 'Street',
};

describe('Checkout acceptance uses Domain against locked stock', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    storage.transaction.mockImplementation((action) => action(db));
    storage.catalog.mockReturnValue([
      {
        id: 1,
        productId: 1,
        sku: 'PEN',
        localizedLabel: { en: 'Blue' },
        productName: { en: 'Pen' },
        basePrice: '0.10',
      },
    ]);
    storage.find.mockResolvedValue(null);
    storage.claim.mockResolvedValue({ id: 1 });
    storage.lock.mockResolvedValue([
      { variantId: 1, warehouseId: 2, onHand: 5, reserved: 1 },
      { variantId: 1, warehouseId: 1, onHand: 2, reserved: 1 },
    ]);
    storage.create.mockImplementation((data) =>
      Promise.resolve({
        order: {
          id: 1,
          ...data,
          totalAmount: data.totalAmount,
          orderReference: data.orderReference,
        },
      }),
    );
  });

  it('ignores malformed shipping environment overrides at the command boundary', async () => {
    vi.stubEnv('CHECKOUT_FLAT_SHIPPING_FEE', '1.005');
    try {
      const service = new CheckoutService({ enqueue: storage.enqueue });
      const quote = await service.validate({
        source: 'cart',
        lines: [{ variantId: 1, quantity: 1 }],
      });
      expect(quote).toMatchObject({ success: true, data: { shipping: '50.00', total: '50.10' } });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('refuses merged quantities 998+2 at the command boundary', async () => {
    const service = new CheckoutService({ enqueue: storage.enqueue });
    const lines = [
      { variantId: 1, quantity: 998 },
      { variantId: 1, quantity: 2 },
    ];
    expect(await service.validate({ source: 'cart', lines })).toMatchObject({
      success: false,
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
          address,
          guestEmail: 'guest@example.com',
        },
        { idempotencyKey: 'overflow' },
      ),
    ).toMatchObject({ success: false, status: 400, error: { code: 'validation-error' } });
    expect(storage.find).not.toHaveBeenCalled();
  });

  it('persists Domain pricing, merged lines and deterministic warehouse allocation, then replays', async () => {
    const service = new CheckoutService({ enqueue: storage.enqueue });
    const lines = [
      { variantId: 1, quantity: 2 },
      { variantId: 1, quantity: 1 },
    ];
    const quote = await service.validate({ source: 'cart', lines });
    if (!quote.success) throw new Error('Quote failed');
    const input = {
      source: 'cart' as const,
      lines,
      confirmation: quote.data.confirmation,
      paymentMethod: 'cod' as const,
      address,
      guestEmail: 'GUEST@EXAMPLE.COM',
    };
    const context = { idempotencyKey: 'allocation' };
    const accepted = await service.accept(input, context);
    expect(accepted).toMatchObject({
      success: true,
      status: 201,
      data: { order: { totalAmount: '50.30' } },
    });
    expect(storage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subtotal: '0.30',
        shippingCost: '50.00',
        totalAmount: '50.30',
        guestEmail: 'guest@example.com',
        items: [expect.objectContaining({ quantity: 3, unitPrice: '0.10', lineTotal: '0.30' })],
      }),
      db,
    );
    expect(storage.persist).toHaveBeenCalledWith(
      1,
      [
        { variantId: 1, warehouseId: 1, quantity: 1 },
        { variantId: 1, warehouseId: 2, quantity: 2 },
      ],
      db,
    );
    const saved = storage.record.mock.calls[0][1];
    storage.find.mockResolvedValue({
      fingerprint: storage.claim.mock.calls[0][0].fingerprint,
      response: saved.response,
    });
    storage.catalog.mockImplementation(() => {
      throw new Error('Replay must not reprice');
    });
    expect(await service.accept(input, context)).toEqual(accepted);
    expect(storage.create).toHaveBeenCalledTimes(1);
    expect(storage.persist).toHaveBeenCalledTimes(1);
    expect(storage.enqueue).toHaveBeenCalledTimes(1);
  });

  it('returns the new domain Quote on changed terms before creating or reserving', async () => {
    const service = new CheckoutService({ enqueue: storage.enqueue });
    const lines = [{ variantId: 1, quantity: 1 }];
    const quote = await service.validate({ source: 'cart', lines });
    if (!quote.success) throw new Error('Quote failed');
    storage.catalog.mockReturnValue([
      { id: 1, productId: 1, sku: 'PEN', productName: { en: 'Pen' }, basePrice: '0.20' },
    ]);
    expect(
      await service.accept(
        {
          source: 'cart',
          lines,
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address,
          guestEmail: 'guest@example.com',
        },
        { idempotencyKey: 'changed' },
      ),
    ).toMatchObject({
      status: 409,
      error: { code: 'reconfirmation-required', quote: { subtotal: '0.20', total: '50.20' } },
    });
    expect(storage.create).not.toHaveBeenCalled();
    expect(storage.persist).not.toHaveBeenCalled();
    expect(storage.record).not.toHaveBeenCalled();
  });

  it('returns domain shortfalls before writing any order, allocation or outbox event', async () => {
    const service = new CheckoutService({ enqueue: storage.enqueue });
    const lines = [{ variantId: 1, quantity: 6 }];
    const quote = await service.validate({ source: 'cart', lines });
    if (!quote.success) throw new Error('Quote failed');
    expect(
      await service.accept(
        {
          source: 'cart',
          lines,
          confirmation: quote.data.confirmation,
          paymentMethod: 'cod',
          address,
          guestEmail: 'guest@example.com',
        },
        { idempotencyKey: 'short' },
      ),
    ).toMatchObject({
      status: 409,
      error: {
        code: 'insufficient-stock',
        shortfalls: [{ variantId: 1, requested: 6, available: 5 }],
      },
    });
    expect(storage.create).not.toHaveBeenCalled();
    expect(storage.persist).not.toHaveBeenCalled();
    expect(storage.enqueue).not.toHaveBeenCalled();
    expect(storage.record).not.toHaveBeenCalled();
  });

  it('refuses missing phone and guest email before accessing storage', async () => {
    const service = new CheckoutService({ enqueue: storage.enqueue });
    const input = {
      source: 'cart' as const,
      lines: [{ variantId: 1, quantity: 1 }],
      confirmation: 'unused',
      paymentMethod: 'cod' as const,
      address: { ...address },
      guestEmail: 'guest@example.com',
    };
    Reflect.deleteProperty(input.address, 'phone');
    expect(await service.accept(input, { idempotencyKey: 'no-phone' })).toMatchObject({
      status: 400,
      error: { code: 'validation-error' },
    });
    expect(
      await service.accept(
        { ...input, address, guestEmail: undefined },
        { idempotencyKey: 'no-email' },
      ),
    ).toMatchObject({ status: 400, error: { code: 'validation-error' } });
    expect(storage.find).not.toHaveBeenCalled();
  });
});
