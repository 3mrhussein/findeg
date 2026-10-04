import { eq } from 'drizzle-orm';
import { orders } from '@findeg/db/schema';
import { earnOrderRewardEntitlements, type RewardsTransaction } from '@findeg/db/queries/rewards';

/**
 * Shared earn check (ADR-0006). Both `transitionOrderStatus` and `transitionPaymentStatus` call it
 * after their update, inside their transaction (the Order row lock is already held). Points are
 * earned once the Order is `delivered` and `paid`; a cancelled or refunded Order never earns.
 * It reads the Order's current state and relies on the unique `paid` index, so repeating it is safe.
 */
export async function evaluateEarnEligibility(
  orderId: number,
  tx: RewardsTransaction,
): Promise<void> {
  const [order] = await tx
    .select({ status: orders.status, paymentStatus: orders.paymentStatus })
    .from(orders)
    .where(eq(orders.id, orderId));
  if (!order || order.status !== 'delivered' || order.paymentStatus !== 'paid') return;
  await earnOrderRewardEntitlements(tx, orderId);
}
