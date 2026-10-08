import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { OrderStatusUpdateSchema, getAllowedOrderStatusTransitions } from '@findeg/orders/schemas';
import { isNotifiedOrderStatus, orderStatusId } from '@findeg/orders/events';

vi.mock('@findeg/db/connection', () => {
  throw new Error('Pure entries must not load the connection');
});
const require = createRequire(import.meta.url);
describe('public package resolution', () => {
  it('resolves all public entries and rejects internal paths', () => {
    for (const entry of ['@findeg/orders', '@findeg/orders/schemas', '@findeg/orders/events']) {
      expect(require.resolve(entry)).toContain('/packages/orders/src/');
    }
    expect(() => require.resolve('@findeg/orders/mapper')).toThrow(/not defined by "exports"/);
    expect(() => require.resolve('@findeg/orders/src/orders.ts')).toThrow(
      /not defined by "exports"/,
    );
  });
  it('pure schemas validate without application configuration', () => {
    expect(OrderStatusUpdateSchema.parse({ status: 'shipped', trackingNumber: 'ABC' })).toEqual({
      status: 'shipped',
      trackingNumber: 'ABC',
    });
    expect(getAllowedOrderStatusTransitions('shipped')).toEqual(['delivered', 'cancelled']);
  });
  it('the status protocol retains durable message identity and customer-facing policy', () => {
    expect(orderStatusId('FE-000001', 'shipped')).toBe('order-status:FE-000001:shipped');
    expect(isNotifiedOrderStatus('shipped')).toBe(true);
    expect(isNotifiedOrderStatus('processing')).toBe(false);
  });
});

it('callers cannot change the lifecycle policy by editing returned options', () => {
  const targets = getAllowedOrderStatusTransitions('pending');
  targets.push('delivered');
  expect(getAllowedOrderStatusTransitions('pending')).toEqual(['confirmed', 'cancelled']);
});
