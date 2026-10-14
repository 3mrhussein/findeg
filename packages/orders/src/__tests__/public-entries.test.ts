import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { OrderStatusUpdateSchema as orderStatusUpdateSchema } from '@findeg/orders/schemas';
import { orderStatusId } from '@findeg/orders/events';
import { isNotifiedOrderStatus } from '@findeg/domain/orders';

vi.mock('@findeg/db/connection', () => {
  throw new Error('Pure entries must not load the connection');
});
const require = createRequire(import.meta.url);
describe('public package resolution', () => {
  it('resolves all public entries and rejects internal paths', () => {
    for (const entry of [
      '@findeg/orders',
      '@findeg/orders/types',
      '@findeg/orders/schemas',
      '@findeg/orders/events',
    ]) {
      expect(require.resolve(entry)).toContain('/packages/orders/src/');
    }
    expect(() => require.resolve('@findeg/orders/mapper')).toThrow(/not defined by "exports"/);
    expect(() => require.resolve('@findeg/orders/src/orders.ts')).toThrow(
      /not defined by "exports"/,
    );
  });
  it('pure schemas validate without application configuration', () => {
    expect(orderStatusUpdateSchema.parse({ status: 'shipped', trackingNumber: 'ABC' })).toEqual({
      status: 'shipped',
      trackingNumber: 'ABC',
    });
  });
  it('the status protocol retains durable message identity and customer-facing policy', () => {
    expect(orderStatusId('FE-000001', 'shipped')).toBe('order-status:FE-000001:shipped');
    expect(isNotifiedOrderStatus('shipped')).toBe(true);
    expect(isNotifiedOrderStatus('processing')).toBe(false);
  });
});
