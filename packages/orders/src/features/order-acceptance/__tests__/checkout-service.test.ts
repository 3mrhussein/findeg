import { describe, expect, it, vi } from 'vitest';

vi.mock('@findeg/db/connection', async () => {
  const { fakeDatabase } = await import('../../../__tests__/fixture');
  return { db: fakeDatabase().db };
});

vi.mock('@findeg/db/queries', () => ({
  checkoutIdempotencyQueries: {
    // A stored row with another fingerprint answers the replay check without a database.
    findByScopeAndKey: () => Promise.resolve({ fingerprint: 'stored-elsewhere', response: null }),
  },
}));

import { CheckoutService, createCheckoutService } from '../index';

const enqueue = vi.fn(() => Promise.resolve().then(() => undefined));
const service = () => new CheckoutService({ enqueue });

const address = {
  fullName: 'Customer Name',
  phone: '01012345678',
  city: 'Cairo',
  area: 'Nasr City',
  street: 'Street',
  governorate: 'Cairo' as const,
};

const order = {
  source: 'cart' as const,
  lines: [{ variantId: 1, quantity: 1 }],
  confirmation: 'digest',
  paymentMethod: 'cod' as const,
  address,
  guestEmail: 'guest@example.com',
};

describe('checkout service command boundary', () => {
  it('creates a service through the factory with the injected outbox port', () => {
    expect(createCheckoutService({ enqueue })).toBeInstanceOf(CheckoutService);
  });

  it('rejects a non-object body and a payment method other than cod', async () => {
    expect(await service().accept(null as never, { idempotencyKey: 'k' })).toMatchObject({
      status: 400,
      error: { code: 'validation-error' },
    });
    expect(
      await service().accept({ ...order, paymentMethod: 'card' as never }, { idempotencyKey: 'k' }),
    ).toMatchObject({ status: 400, error: { code: 'unsupported-payment-method' } });
  });

  it('requires a signed-in session or a guest email', async () => {
    expect(
      await service().accept({ ...order, guestEmail: undefined }, { idempotencyKey: 'k' }),
    ).toMatchObject({
      status: 400,
      error: { message: 'Either a signed-in session or guestEmail must be provided' },
    });
  });

  it('requires and bounds the Idempotency-Key header and the guest identifier', async () => {
    expect(await service().accept(order, {})).toMatchObject({
      error: { code: 'missing-idempotency-key' },
    });
    expect(await service().accept(order, { idempotencyKey: 'k'.repeat(256) })).toMatchObject({
      error: { code: 'invalid-idempotency-key' },
    });
    expect(
      await service().accept(order, { idempotencyKey: 'k', guestId: 'g'.repeat(201) }),
    ).toMatchObject({ error: { code: 'invalid-guest-id' } });
    // A 200-character guest id passes validation and reaches the idempotency check.
    expect(
      await service().accept(order, { idempotencyKey: 'k', guestId: 'g'.repeat(200) }),
    ).toMatchObject({ status: 409, error: { code: 'idempotency-conflict' } });
  });

  it('refuses an address without a valid Egyptian mobile before storage', async () => {
    expect(
      await service().accept(
        { ...order, address: { ...address, phone: '12345' } },
        { idempotencyKey: 'bad-phone' },
      ),
    ).toMatchObject({ status: 400, error: { code: 'validation-error' } });
  });

  it('reports a list selection on an unpublished list as unavailable', async () => {
    const result = await service().validate({
      source: 'list',
      publicCode: '0123456789abcdef0123456789abcdef',
      lines: [{ listItemId: 1, variantId: 2, quantity: 1 }],
    });
    expect(result).toMatchObject({
      success: false,
      status: 409,
      error: { code: 'list-unavailable' },
    });
  });

  it('reports a cart with an unknown or inactive variant as unavailable', async () => {
    expect(
      await service().validate({ source: 'cart', lines: [{ variantId: 1, quantity: 1 }] }),
    ).toMatchObject({
      success: false,
      status: 400,
      error: { code: 'unavailable-variant' },
    });
  });

  it('scopes signed-in, list-sourced and guest-email acceptances without reading their guest email', async () => {
    // Every scope finds a stored row with another fingerprint, so each path ends at the replay check.
    const withoutGovernorate = { ...address, governorate: undefined };
    expect(
      await service().accept(
        {
          ...order,
          guestEmail: 'ignored@example.com',
          address: { ...withoutGovernorate, city: 'Cairo' },
        },
        { userId: 5, idempotencyKey: 'signed-in' },
      ),
    ).toMatchObject({ status: 409, error: { code: 'idempotency-conflict' } });
    expect(
      await service().accept(
        {
          source: 'list',
          publicCode: '0123456789abcdef0123456789abcdef',
          lines: [{ listItemId: 1, variantId: 2, quantity: 1 }],
          confirmation: 'digest',
          paymentMethod: 'cod',
          address,
          guestEmail: 'guest@example.com',
        },
        { idempotencyKey: 'list', guestId: 'device-1' },
      ),
    ).toMatchObject({ status: 409, error: { code: 'idempotency-conflict' } });
    expect(await service().accept(order, { idempotencyKey: 'by-email' })).toMatchObject({
      status: 409,
      error: { code: 'idempotency-conflict' },
    });
  });

  it('reports a malformed list request as a validation error before any lookup', async () => {
    expect(
      await service().validate({
        source: 'list',
        publicCode: '',
        lines: [],
      }),
    ).toMatchObject({ success: false, status: 400, error: { code: 'validation-error' } });
  });
});
