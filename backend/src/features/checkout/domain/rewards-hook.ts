import type { DbTransaction } from '@findeg/db/queries';

export interface RewardsHookOrderItem {
  id: number;
  productId?: number | null;
  variantId?: number | null;
  quantity: number;
  lineTotal: string | number;
}

export interface RewardsHookOrder {
  id: number;
  orderReference: string;
  totalAmount: string;
  currency: string;
  userId?: number | null;
  guestEmail?: string | null;
}

/**
 * Named hook point for Partner Rewards (issue #238 / ADR-0005 / ADR-0006).
 * Called inside the acceptance transaction after the order and items exist.
 * Documented as a no-op in this spec; the Partner Rewards spec implements entitlements and events.
 */
export async function onOrderAcceptedRewardsHook(
  _tx: DbTransaction,
  _order: RewardsHookOrder,
  _items: RewardsHookOrderItem[],
  _attribution?: Record<string, unknown> | null,
): Promise<void> {
  // Named no-op hook for Partner Rewards spec.
}
