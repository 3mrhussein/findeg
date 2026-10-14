import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  changeOrderStatus,
  changePaymentStatus,
  refundOrder,
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

// Every payment move on a delivered Order. Ported from @findeg/orders' table (unpaid -> paid ->
// refunded, same status a no-op); a payment refund on its own is now refused (joint Refund).
const DELIVERED_PAYMENT_MOVES: Record<PaymentStatus, Record<PaymentStatus, string>> = {
  unpaid: { unpaid: 'no-op', paid: 'paid', refunded: 'INVALID_PAYMENT_STATUS_TRANSITION' },
  paid: {
    unpaid: 'INVALID_PAYMENT_STATUS_TRANSITION',
    paid: 'no-op',
    refunded: 'PAYMENT_REFUND_NEEDS_ORDER_REFUND',
  },
  refunded: {
    unpaid: 'INVALID_PAYMENT_STATUS_TRANSITION',
    paid: 'INVALID_PAYMENT_STATUS_TRANSITION',
    refunded: 'no-op',
  },
};

const EVERY_MOVE = PAYMENT_STATUSES.flatMap((from) =>
  PAYMENT_STATUSES.map((to) => [from, to, DELIVERED_PAYMENT_MOVES[from][to]] as const),
);

describe('payment status changes', () => {
  it.each(EVERY_MOVE)('delivered Order, payment %s -> %s: %s', (from, to, outcome) => {
    const order = { status: 'delivered', paymentStatus: from } as const;
    const change = () => changePaymentStatus(order, to);

    if (outcome === 'no-op') {
      expect(change()).toMatchObject({ status: 'delivered', paymentStatus: from, changed: false });
    } else if (outcome === 'paid') {
      expect(change()).toMatchObject({
        status: 'delivered',
        paymentStatus: 'paid',
        changed: true,
        stockSettlement: null,
      });
    } else {
      expect(codeOf(change)).toBe(outcome);
    }
  });

  it.each(ORDER_STATUSES.filter((status) => status !== 'delivered'))(
    'change: payment cannot become paid while the Order is %s',
    (status) => {
      expect(codeOf(() => changePaymentStatus({ status, paymentStatus: 'unpaid' }, 'paid'))).toBe(
        'PAID_BEFORE_DELIVERY',
      );
    },
  );
});

describe('Refund', () => {
  it('change: moves a delivered, paid Order and its payment to refunded together', () => {
    const order = { status: 'delivered', paymentStatus: 'paid' } as const;
    const refunded = {
      status: 'refunded',
      paymentStatus: 'refunded',
      changed: true,
      // A refund has no stock effect: restocking a returned item is a manual adjustment.
      stockSettlement: null,
    };
    expect(refundOrder(order)).toEqual(refunded);
    expect(changeOrderStatus(order, 'refunded')).toEqual(refunded);
  });

  it('change: a delivered Order that is not paid cannot be refunded, so neither status moves', () => {
    const order = { status: 'delivered', paymentStatus: 'unpaid' } as const;
    expect(codeOf(() => refundOrder(order))).toBe('REFUND_NEEDS_PAID_ORDER');
    expect(codeOf(() => changeOrderStatus(order, 'refunded'))).toBe('REFUND_NEEDS_PAID_ORDER');
  });

  it.each(['pending', 'confirmed', 'processing', 'shipped', 'cancelled'] as const)(
    'refuses to refund a %s Order',
    (status) => {
      expect(codeOf(() => refundOrder({ status, paymentStatus: 'unpaid' }))).toBe(
        'INVALID_ORDER_STATUS_TRANSITION',
      );
    },
  );

  it('refunding a refunded Order is a no-op', () => {
    expect(refundOrder({ status: 'refunded', paymentStatus: 'refunded' })).toEqual({
      status: 'refunded',
      paymentStatus: 'refunded',
      changed: false,
      stockSettlement: null,
    });
  });
});
