import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db/types';
import { enqueue } from '@findeg/db/queries/outbox';
import { consumeOrderStock, releaseOrderStock } from '@findeg/db/queries/stock-reservations';
import {
  InvalidOrderStatusTransitionError,
  InvalidPaymentStatusTransitionError,
  OrderNotFoundError,
} from '../../order-errors';
import { createOrders } from '../../../helpers';
import { fakeDatabase, storedOrder } from '../../../__tests__/fixture';

vi.mock('@findeg/db/queries/outbox', () => ({ enqueue: vi.fn(() => Promise.resolve()) }));
vi.mock('@findeg/db/queries/stock-reservations', () => ({
  consumeOrderStock: vi.fn(() => Promise.resolve()),
  releaseOrderStock: vi.fn(() => Promise.resolve()),
}));

const writer = {
  kind: 'staff' as const,
  userId: 1,
  permissionCodes: [PERMISSION_CODES.ADMIN_ORDERS_WRITE],
};
const now = new Date('2026-10-14T08:00:00Z');

describe('Order status changes', () => {
  beforeEach(() => {
    vi.mocked(enqueue).mockClear();
    vi.mocked(consumeOrderStock).mockClear();
    vi.mocked(releaseOrderStock).mockClear();
  });

  it('moves a pending Order to confirmed and records the audit entry', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'pending' })]);
    const result = await createOrders({ db: fake.db as never, now: () => now }).changeStatus(
      writer,
      9,
      { status: 'confirmed' },
    );
    expect(result).toEqual({ changed: true, previousStatus: 'pending', status: 'confirmed' });
    expect(fake.callsTo('set')[0].args[0]).toMatchObject({ status: 'confirmed', updatedAt: now });
    expect(fake.callsTo('values')[0].args[0]).toMatchObject({
      adminUserId: 1,
      entityType: 'order',
      entityId: '9',
      action: 'update_status',
      oldValues: { status: 'pending' },
      newValues: { status: 'confirmed' },
    });
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('enqueues the customer notification for a notified status', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'processing' })]);
    await createOrders({ db: fake.db as never, now: () => now }).changeStatus(writer, 9, {
      status: 'shipped',
      trackingNumber: 'TRK-9',
    });
    expect(enqueue).toHaveBeenCalledWith(
      expect.anything(),
      'order-status:FE-000009:shipped',
      'order-status',
      { orderId: 9, status: 'shipped' },
    );
    expect(fake.callsTo('set')[0].args[0]).toMatchObject({ status: 'shipped' });
  });

  it('records tracking and note changes only when they differ from the stored values', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'confirmed', trackingNumber: 'OLD' })]);
    await createOrders({ db: fake.db as never, now: () => now }).changeStatus(writer, 9, {
      status: 'processing',
      trackingNumber: 'NEW',
      adminNotes: 'packed',
    });
    expect(fake.callsTo('values')[0].args[0]).toMatchObject({
      oldValues: { status: 'confirmed', trackingNumber: 'OLD', adminNotes: null },
      newValues: { status: 'processing', trackingNumber: 'NEW', adminNotes: 'packed' },
    });
  });

  it('reports an unchanged status without writing', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'confirmed' })]);
    const result = await createOrders({ db: fake.db as never }).changeStatus(writer, 9, {
      status: 'confirmed',
    });
    expect(result).toEqual({ changed: false, previousStatus: 'confirmed', status: 'confirmed' });
    expect(fake.callsTo('update')).toHaveLength(0);
  });

  it('rejects an illegal status move with the allowed targets', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'pending' })]);
    await expect(
      createOrders({ db: fake.db as never }).changeStatus(writer, 9, { status: 'delivered' }),
    ).rejects.toMatchObject({
      name: 'InvalidOrderStatusTransitionError',
      allowedTargets: ['confirmed', 'cancelled'],
    });
    expect(fake.callsTo('update')).toHaveLength(0);
  });

  it('reports a missing Order before any change', async () => {
    const fake = fakeDatabase([]);
    await expect(
      createOrders({ db: fake.db as never }).changeStatus(writer, 404, { status: 'confirmed' }),
    ).rejects.toBeInstanceOf(OrderNotFoundError);
  });

  it('refunds a delivered, paid Order and records the refund action', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'delivered', paymentStatus: 'paid' })]);
    const result = await createOrders({ db: fake.db as never, now: () => now }).refund(writer, 9);
    expect(result).toEqual({ changed: true, previousStatus: 'delivered', status: 'refunded' });
    expect(fake.callsTo('values')[0].args[0]).toMatchObject({ action: 'refund' });
    expect(fake.callsTo('set')[0].args[0]).toMatchObject({
      status: 'refunded',
      paymentStatus: 'refunded',
    });
  });

  it('maps a refund of an unpaid Order to the status transition error', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'delivered', paymentStatus: 'unpaid' })]);
    await expect(createOrders({ db: fake.db as never }).refund(writer, 9)).rejects.toBeInstanceOf(
      InvalidOrderStatusTransitionError,
    );
  });

  it('returns an already refunded Order without writing', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'refunded', paymentStatus: 'refunded' })]);
    const result = await createOrders({ db: fake.db as never }).refund(writer, 9);
    expect(result).toEqual({ changed: false, previousStatus: 'refunded', status: 'refunded' });
    expect(fake.callsTo('update')).toHaveLength(0);
  });

  it('marks a delivered Order as paid and records the payment audit entry', async () => {
    const fake = fakeDatabase([storedOrder({ status: 'delivered', paymentStatus: 'unpaid' })]);
    const result = await createOrders({ db: fake.db as never, now: () => now }).changePaymentStatus(
      writer,
      9,
      'paid',
    );
    expect(result).toEqual({ changed: true, previousStatus: 'unpaid', status: 'paid' });
    expect(fake.callsTo('values')[0].args[0]).toMatchObject({
      action: 'update_payment_status',
      oldValues: { paymentStatus: 'unpaid' },
      newValues: { paymentStatus: 'paid' },
    });
  });

  it('reports an unchanged payment status without writing', async () => {
    const fake = fakeDatabase([storedOrder({ paymentStatus: 'paid' })]);
    const result = await createOrders({ db: fake.db as never }).changePaymentStatus(
      writer,
      9,
      'paid',
    );
    expect(result).toEqual({ changed: false, previousStatus: 'paid', status: 'paid' });
    expect(fake.callsTo('update')).toHaveLength(0);
  });

  it('rejects an illegal payment move with the payment transition error', async () => {
    const fake = fakeDatabase([storedOrder({ paymentStatus: 'refunded' })]);
    await expect(
      createOrders({ db: fake.db as never }).changePaymentStatus(writer, 9, 'paid'),
    ).rejects.toBeInstanceOf(InvalidPaymentStatusTransitionError);
  });

  it('reports a missing Order for a payment change', async () => {
    await expect(
      createOrders({ db: fakeDatabase([]).db as never }).changePaymentStatus(writer, 404, 'paid'),
    ).rejects.toBeInstanceOf(OrderNotFoundError);
  });
});
