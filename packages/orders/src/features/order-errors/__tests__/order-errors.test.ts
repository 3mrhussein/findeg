import { describe, expect, it } from 'vitest';
import { OrderError } from '@findeg/domain';
import {
  InvalidOrderStatusTransitionError,
  InvalidPaymentStatusTransitionError,
  OrderNotFoundError,
  mapOrderRuleError,
} from '../index';

const progress = { status: 'pending', paymentStatus: 'unpaid' } as const;

describe('Order application errors', () => {
  it('names the missing Order in its message and error name', () => {
    const error = new OrderNotFoundError(12);
    expect(error.message).toBe('Order #12 not found');
    expect(error.name).toBe('OrderNotFoundError');
    expect(error.orderId).toBe(12);
  });

  it('keeps unrelated errors unchanged', () => {
    const unrelated = new Error('database down');
    expect(mapOrderRuleError(unrelated, progress, 'confirmed')).toBe(unrelated);
  });

  it('maps a Domain rule error on a status change to the transition error with its targets', () => {
    const domain = new OrderError('INVALID_ORDER_STATUS_TRANSITION', 'no move');
    const mapped = mapOrderRuleError(domain, progress, 'delivered');
    expect(mapped).toBeInstanceOf(InvalidOrderStatusTransitionError);
    expect(mapped).toMatchObject({
      from: 'pending',
      to: 'delivered',
      allowedTargets: ['confirmed', 'cancelled'],
      message: 'no move',
      name: 'InvalidOrderStatusTransitionError',
    });
  });

  it('maps a Domain rule error on a payment change to the payment transition error', () => {
    const domain = new OrderError('INVALID_PAYMENT_STATUS_TRANSITION', 'no payment move');
    const mapped = mapOrderRuleError(domain, progress, undefined, 'refunded');
    expect(mapped).toBeInstanceOf(InvalidPaymentStatusTransitionError);
    expect(mapped).toMatchObject({
      from: 'unpaid',
      to: 'refunded',
      allowedTargets: ['paid'],
      message: 'no payment move',
    });
  });

  it('returns the Domain error when neither a status nor a payment status was requested', () => {
    const domain = new OrderError('INVALID_ORDER_STATUS_TRANSITION', 'raw');
    expect(mapOrderRuleError(domain, progress)).toBe(domain);
  });

  it('reports an empty target list as none', () => {
    const error = new InvalidOrderStatusTransitionError('cancelled', 'pending', []);
    expect(error.message).toBe(
      'Invalid status transition from cancelled to pending. Allowed: none.',
    );
    const payment = new InvalidPaymentStatusTransitionError('refunded', 'paid', []);
    expect(payment.message).toBe(
      'Invalid payment status transition from refunded to paid. Allowed: none.',
    );
  });
});
