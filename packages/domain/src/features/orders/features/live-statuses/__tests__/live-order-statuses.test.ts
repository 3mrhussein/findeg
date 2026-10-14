import { describe, expect, it } from 'vitest';
import { LIVE_ORDER_STATUSES, ORDER_STATUSES, isLiveOrderStatus } from '@findeg/domain';

// Ported from partner-sales' REPORTED_ORDER_STATUSES and reviews' purchasable statuses.
describe('live Order statuses', () => {
  it('are every status but cancelled and refunded', () => {
    expect(LIVE_ORDER_STATUSES).toEqual([
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
    ]);
  });

  it.each(
    ORDER_STATUSES.map((status) => [status, !['cancelled', 'refunded'].includes(status)] as const),
  )('a %s Order is live: %s', (status, live) => {
    expect(isLiveOrderStatus(status)).toBe(live);
  });
});
