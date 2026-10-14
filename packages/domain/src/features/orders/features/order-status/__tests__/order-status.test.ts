import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain';
import {
  ORDER_STATUSES,
  changeOrderStatus,
  type OrderStatus,
  type PaymentStatus,
} from '@findeg/domain';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return (error as DomainError).code;
    throw error;
  }
}

/** The payment status an Order normally has while in each status. */
const PAYMENT_WHILE: Record<OrderStatus, PaymentStatus> = {
  pending: 'unpaid',
  confirmed: 'unpaid',
  processing: 'unpaid',
  shipped: 'unpaid',
  delivered: 'paid',
  cancelled: 'unpaid',
  refunded: 'refunded',
};

// Ported from @findeg/orders' transition table and the Backend's every-status integration
// tests: a same-status change is a no-op, a listed move is allowed, anything else is refused.
const ALLOWED: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

const EVERY_MOVE = ORDER_STATUSES.flatMap((from) =>
  ORDER_STATUSES.map((to) => [from, to] as const),
);

describe('Order status changes', () => {
  it.each(EVERY_MOVE)('%s -> %s', (from, to) => {
    const order = { status: from, paymentStatus: PAYMENT_WHILE[from] };
    const change = () => changeOrderStatus(order, to, { parcelBackInWarehouse: true });

    if (from === to) {
      expect(change()).toMatchObject({ status: from, changed: false, stockSettlement: null });
    } else if (ALLOWED[from].includes(to)) {
      expect(change()).toMatchObject({ status: to, changed: true });
    } else {
      expect(codeOf(change)).toBe('INVALID_ORDER_STATUS_TRANSITION');
    }
  });

  it('settles the Stock Reservation: consumed on delivery, released on cancellation', () => {
    const shipped = { status: 'shipped', paymentStatus: 'unpaid' } as const;
    expect(changeOrderStatus(shipped, 'delivered').stockSettlement).toBe('consume');
    expect(changeOrderStatus({ ...shipped, status: 'pending' }, 'cancelled').stockSettlement).toBe(
      'release',
    );
    expect(changeOrderStatus({ ...shipped, status: 'pending' }, 'confirmed').stockSettlement).toBe(
      null,
    );
  });

  it('keeps the payment status on a plain status change', () => {
    expect(
      changeOrderStatus({ status: 'shipped', paymentStatus: 'unpaid' }, 'delivered'),
    ).toMatchObject({ status: 'delivered', paymentStatus: 'unpaid' });
  });

  it('change: cancelling a shipped Order needs the parcel-back assertion', () => {
    const shipped = { status: 'shipped', paymentStatus: 'unpaid' } as const;
    expect(codeOf(() => changeOrderStatus(shipped, 'cancelled'))).toBe(
      'SHIPPED_CANCELLATION_NEEDS_PARCEL_BACK',
    );
    expect(
      codeOf(() => changeOrderStatus(shipped, 'cancelled', { parcelBackInWarehouse: false })),
    ).toBe('SHIPPED_CANCELLATION_NEEDS_PARCEL_BACK');
    expect(changeOrderStatus(shipped, 'cancelled', { parcelBackInWarehouse: true })).toMatchObject({
      status: 'cancelled',
      changed: true,
      stockSettlement: 'release',
    });
  });

  it('cancelling before shipping needs no assertion', () => {
    for (const status of ['pending', 'confirmed', 'processing'] as const) {
      expect(changeOrderStatus({ status, paymentStatus: 'unpaid' }, 'cancelled').status).toBe(
        'cancelled',
      );
    }
  });
});
