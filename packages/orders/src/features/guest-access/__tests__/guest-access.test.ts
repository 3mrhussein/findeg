import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  findGuestOrder: vi.fn(),
  createRequest: vi.fn(),
  findOrderIdByReference: vi.fn(),
  attemptVerification: vi.fn(),
  getById: vi.fn(),
  enqueue: vi.fn(),
}));

vi.mock('@findeg/db/queries', () => ({
  guestAccessQueries: {
    findGuestOrder: storage.findGuestOrder,
    createRequest: storage.createRequest,
    findOrderIdByReference: storage.findOrderIdByReference,
    attemptVerification: storage.attemptVerification,
  },
  orderQueries: { getById: storage.getById },
  withTransaction: (_tx: unknown, run: (tx: unknown) => Promise<unknown>) => run({ tx: true }),
}));

import { createGuestAccessService } from '../index';

const SECRET = 'test-guest-access-secret-1234567890123456';
// A stand-in for the backend token port: the token names its Order, so verification is observable.
const tokens = {
  sign: (orderReference: string) => Promise.resolve(`token:${orderReference}`),
  verify: (token: string | undefined) =>
    Promise.resolve(token?.startsWith('token:') ? token.slice('token:'.length) : null),
};
const service = () =>
  createGuestAccessService({ enqueue: storage.enqueue, secret: () => SECRET, tokens });

describe('guest order access', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('answers success without enqueueing when the reference and email do not match', async () => {
    storage.findGuestOrder.mockResolvedValue(undefined);
    expect(
      await service().requestAccess({ reference: 'fe-1', email: 'Nobody@Example.com' }),
    ).toEqual({
      success: true,
    });
    expect(storage.findGuestOrder).toHaveBeenCalledWith('FE-1', 'nobody@example.com', { tx: true });
    expect(storage.enqueue).not.toHaveBeenCalled();
  });

  it('enqueues one access email for a matching guest order', async () => {
    storage.findGuestOrder.mockResolvedValue({ id: 5 });
    storage.createRequest.mockResolvedValue({ id: 'req-9' });
    expect(await service().requestAccess({ reference: 'FE-5', email: 'g@example.com' })).toEqual({
      success: true,
    });
    expect(storage.enqueue).toHaveBeenCalledWith(
      { tx: true },
      'guest-access:req-9',
      'guest-access',
      { accessRequestId: 'req-9' },
    );
  });

  it('rejects malformed access requests as invalid input', async () => {
    expect(await service().requestAccess({ reference: '', email: 'x' })).toEqual({
      success: false,
      reason: 'invalid-input',
    });
    expect(await service().verify({ reference: 'FE-1', code: 'nope' })).toEqual({
      success: false,
      reason: 'invalid-input',
    });
  });

  it('reports an unknown reference or wrong code as invalid-code', async () => {
    storage.findOrderIdByReference.mockResolvedValueOnce(null);
    expect(await service().verify({ reference: 'FE-1', code: '123456' })).toEqual({
      success: false,
      reason: 'invalid-code',
    });
    storage.findOrderIdByReference.mockResolvedValueOnce(7);
    storage.attemptVerification.mockResolvedValueOnce(false);
    expect(await service().verify({ reference: 'FE-7', code: '123456' })).toEqual({
      success: false,
      reason: 'invalid-code',
    });
  });

  it('issues a token for the one Order after a correct code', async () => {
    storage.findOrderIdByReference.mockResolvedValueOnce(7);
    storage.attemptVerification.mockResolvedValueOnce(true);
    const result = await service().verify({ reference: 'fe-7', code: '123456' });
    expect(result).toMatchObject({ success: true, orderReference: 'FE-7', maxAgeSeconds: 1800 });
    if (!result.success) throw new Error('expected success');
    expect(await tokens.verify(result.token)).toBe('FE-7');
  });

  it('returns the order view only for a token issued for that reference', async () => {
    storage.findOrderIdByReference.mockResolvedValue(7);
    storage.getById.mockResolvedValue({
      order: {
        orderReference: 'FE-7',
        status: 'pending',
        paymentStatus: 'unpaid',
        currency: 'EGP',
        subtotal: '25.00',
        shippingCost: '50.00',
        totalAmount: '75.00',
        createdAt: new Date('2026-10-14T10:00:00Z'),
      },
      items: [{ productNameSnapshot: 'Pen', quantity: 2, totalPrice: '25.00' }],
    });
    storage.findOrderIdByReference.mockResolvedValue(7);
    storage.attemptVerification.mockResolvedValue(true);
    const token = await service().verify({ reference: 'FE-7', code: '123456' });
    if (!token.success) throw new Error('expected success');

    expect(await service().getOrder(undefined, 'FE-7')).toBeNull();
    expect(await service().getOrder(token.token, 'FE-8')).toBeNull();
    expect(await service().getOrder(token.token, 'fe-7')).toEqual({
      orderReference: 'FE-7',
      status: 'pending',
      paymentStatus: 'unpaid',
      currency: 'EGP',
      subtotal: '25.00',
      shippingCost: '50.00',
      totalAmount: '75.00',
      createdAt: new Date('2026-10-14T10:00:00Z'),
      items: [{ name: 'Pen', quantity: 2, totalPrice: '25.00' }],
    });
  });
});
