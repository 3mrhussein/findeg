import type { DbTransaction } from '@findeg/db/queries';
import type { OrderStatus } from '@findeg/backend/features/core';

export interface OrderStatusRewardsHookEvent {
  orderId: number;
  previousStatus: OrderStatus;
  status: 'cancelled' | 'refunded';
}

/**
 * Named hook point for Partner Rewards (issue #241 / ADR-0005 / ADR-0006).
 * Called inside the Order status transaction for cancellation and refund.
 * This spec intentionally leaves it as a no-op; the Partner Rewards spec adds
 * cancellation/reversal events here without opening a second transaction.
 */
export async function onOrderStatusRewardsHook(
  _tx: DbTransaction,
  _event: OrderStatusRewardsHookEvent,
): Promise<void> {
  // Named no-op hook for Partner Rewards spec.
}
