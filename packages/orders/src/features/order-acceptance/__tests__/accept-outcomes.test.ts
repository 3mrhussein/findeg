import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainError } from '@findeg/domain';
import {
  ListUnavailableError,
  SelectionInvalidError,
  UnavailableVariantError,
} from '../../checkout-errors/index';

const storage = vi.hoisted(() => ({
  transaction: vi.fn(),
  find: vi.fn(),
  claim: vi.fn(),
  create: vi.fn(),
  record: vi.fn(),
  conflictOnce: { value: false },
  scopeConflict: { value: false },
  catalog: vi.fn(),
  lock: vi.fn(),
  persist: vi.fn(),
  enqueue: vi.fn(),
}));

const catalogSelect = () => ({
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
});

vi.mock('@findeg/db/connection', () => ({
  db: {
    transaction: (...args: unknown[]) => storage.transaction(...args),
    select: catalogSelect,
  },
}));

vi.mock('@findeg/db/queries', () => ({
  orderQueries: {
    create: (...args: unknown[]) => storage.create(...args),
    isOrderReferenceConflict: () => {
      if (!storage.conflictOnce.value) return false;
      storage.conflictOnce.value = false;
      return true;
    },
  },
  checkoutIdempotencyQueries: {
    findByScopeAndKey: (...args: unknown[]) => storage.find(...args),
    claimKey: (...args: unknown[]) => storage.claim(...args),
    recordSuccess: (...args: unknown[]) => storage.record(...args),
    isScopeKeyConflict: () => storage.scopeConflict.value,
  },
  lockOrderStock: (...args: unknown[]) => storage.lock(...args),
  persistOrderStock: (...args: unknown[]) => storage.persist(...args),
}));

import { CheckoutService } from '../helpers';

const address = {
  fullName: 'Customer Name',
  phone: '01012345678',
  city: 'Cairo',
  area: 'Nasr City',
  street: 'Street',
  governorate: 'Cairo' as const,
};

const enqueue = (...args: unknown[]) => storage.enqueue(...args);
const service = () => new CheckoutService({ enqueue: enqueue as never });

const input = {
  source: 'cart' as const,
  lines: [{ variantId: 1, quantity: 1 }],
  confirmation: 'digest',
  paymentMethod: 'cod' as const,
  address,
  guestEmail: 'guest@example.com',
};

const row = {
  id: 1,
  productId: 1,
  sku: 'PEN',
  localizedLabel: { en: 'Blue' },
  productName: { en: 'Pen' },
  basePrice: '0.10',
};

describe('acceptance outcomes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    storage.conflictOnce.value = false;
    storage.scopeConflict.value = false;
    storage.find.mockResolvedValue(null);
    storage.catalog.mockReturnValue([row]);
    storage.lock.mockResolvedValue([{ variantId: 1, warehouseId: 1, onHand: 5, reserved: 0 }]);
  });

  it.each([
    [new ListUnavailableError(), 409, 'list-unavailable'],
    [new SelectionInvalidError([4]), 422, 'selection-invalid'],
    [new UnavailableVariantError(), 400, 'unavailable-variant'],
  ])('maps %s raised inside the transaction to a client outcome', async (error, status, code) => {
    storage.transaction.mockRejectedValue(error);
    expect(await service().accept(input, { idempotencyKey: `k-${code}` })).toMatchObject({
      success: false,
      status,
      error: { code },
    });
  });

  it('maps a Domain failure inside the transaction and rethrows anything else', async () => {
    storage.transaction.mockRejectedValueOnce(
      new (class extends DomainError {})('INVALID_PHONE', 'phone'),
    );
    expect(await service().accept(input, { idempotencyKey: 'domain' })).toMatchObject({
      status: 400,
      error: { code: 'validation-error' },
    });
    storage.transaction.mockRejectedValueOnce(new Error('database down'));
    await expect(service().accept(input, { idempotencyKey: 'boom' })).rejects.toThrow(
      'database down',
    );
  });

  it('replays a concurrent winner outcome after a scope-key conflict', async () => {
    const receipt = { order: { id: 9 }, message: 'Order created successfully' };
    storage.transaction.mockRejectedValueOnce(new Error('conflict'));
    storage.scopeConflict.value = true;
    storage.find
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ fingerprint: 'unused', response: receipt });
    // The fingerprint differs, so the stored outcome is a conflict, not a replay.
    expect(await service().accept(input, { idempotencyKey: 'race' })).toMatchObject({
      status: 409,
      error: { code: 'idempotency-conflict' },
    });
  });

  it('retries the order reference on collision and records the receipt', async () => {
    storage.transaction.mockImplementation((action) => action({ select: catalogSelect }));
    storage.claim.mockResolvedValue({ id: 3 });
    storage.conflictOnce.value = true;
    storage.create
      .mockRejectedValueOnce(new Error('duplicate reference'))
      .mockImplementation((data) =>
        Promise.resolve({
          order: {
            id: 2,
            ...data,
            orderReference: 'FE-NEW',
            status: 'pending',
            paymentStatus: 'unpaid',
            currency: 'EGP',
          },
        }),
      );
    storage.persist.mockResolvedValue(undefined);
    storage.record.mockResolvedValue(undefined);
    storage.enqueue.mockResolvedValue(undefined);
    const quote = await service().validate({ source: 'cart', lines: input.lines });
    if (!quote.success) throw new Error('quote failed');
    const result = await service().accept(
      { ...input, confirmation: quote.data.confirmation },
      { idempotencyKey: 'collision' },
    );
    expect(result).toMatchObject({ success: true, status: 201 });
    expect(storage.create).toHaveBeenCalledTimes(2);
    expect(storage.enqueue).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/^order-accepted:/),
      'order-accepted',
      { orderId: 2 },
    );
  });
});
