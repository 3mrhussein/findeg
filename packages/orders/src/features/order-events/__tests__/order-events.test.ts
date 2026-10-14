import { describe, expect, it } from 'vitest';
import { isNotifiedOrderStatus } from '@findeg/domain';
import { ORDER_STATUS_KIND, orderStatusId } from '../index';

describe('Order status message protocol', () => {
  it('keeps the message kind and one durable row id per Order Reference and status', () => {
    expect(ORDER_STATUS_KIND).toBe('order-status');
    expect(orderStatusId('FE-000001', 'shipped')).toBe('order-status:FE-000001:shipped');
    expect(orderStatusId('FE-000001', 'shipped')).toBe(orderStatusId('FE-000001', 'shipped'));
    expect(orderStatusId('FE-000001', 'shipped')).not.toBe(orderStatusId('FE-000001', 'delivered'));
  });

  it('notifies customers only about the Domain-defined statuses', () => {
    expect(isNotifiedOrderStatus('shipped')).toBe(true);
    expect(isNotifiedOrderStatus('processing')).toBe(false);
  });
});
