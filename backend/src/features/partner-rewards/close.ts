import { eq } from 'drizzle-orm';
import { orders } from '@findeg/db/schema';
import { closeOrderRewardEntitlements, type RewardsTransaction } from '@findeg/db/queries/rewards';

/**
 * Shared cancel/refund check (ADR-0006). Both Order transitions call it after their update, inside
 * their transaction (the Order row lock is already held). A `cancelled` or `refunded` Order, or a
 * `refunded` payment, voids pending points with a `cancellation` and reverses earned ones with a
 * `reversal`. Order `refunded` is authoritative even while payment is still `paid`. It reads the
 * Order's current state and relies on the unique closing-event index, so repeating it is safe.
 */
export async function closeOrderRewards(orderId: number, tx: RewardsTransaction): Promise<void> {
  const [order] = await tx
    .select({ status: orders.status, paymentStatus: orders.paymentStatus })
    .from(orders)
    .where(eq(orders.id, orderId));
  if (!order) return;
  if (
    order.status === 'cancelled' ||
    order.status === 'refunded' ||
    order.paymentStatus === 'refunded'
  ) {
    await closeOrderRewardEntitlements(tx, orderId);
  }
}
