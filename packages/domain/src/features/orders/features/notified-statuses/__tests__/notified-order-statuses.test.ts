import { describe, expect, it } from 'vitest';
import { NOTIFIED_ORDER_STATUSES, ORDER_STATUSES, isNotifiedOrderStatus } from '@findeg/domain';

// Ported from @findeg/orders' events entry (CO-16). There is no refund email.
describe('notified Order statuses', () => {
  it('are shipped, delivered and cancelled', () => {
    expect(NOTIFIED_ORDER_STATUSES).toEqual(['shipped', 'delivered', 'cancelled']);
  });

  it.each(
    ORDER_STATUSES.map(
      (status) => [status, ['shipped', 'delivered', 'cancelled'].includes(status)] as const,
    ),
  )('a move to %s notifies the Customer: %s', (status, notified) => {
    expect(isNotifiedOrderStatus(status)).toBe(notified);
  });
});
