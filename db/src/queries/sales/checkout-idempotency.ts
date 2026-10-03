import { db } from '../../connection';
import { checkoutIdempotency, type CheckoutIdempotency } from '../../schema';
import { eq, and, sql } from 'drizzle-orm';
import { withTransaction, type DbTransaction } from '../transaction';
import type { CheckoutReceipt } from '../../types/sales';

export const IDEMPOTENCY_RETENTION_HOURS = 24;

export async function findByScopeAndKey(
  scope: string,
  key: string,
  tx?: DbTransaction,
): Promise<CheckoutIdempotency | null> {
  const executor = tx ?? db;
  const [row] = await executor
    .select()
    .from(checkoutIdempotency)
    .where(
      and(
        eq(checkoutIdempotency.scope, scope),
        eq(checkoutIdempotency.key, key),
        sql`${checkoutIdempotency.createdAt} >= now() - interval '24 hours'`,
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function createInitial(
  data: {
    scope: string;
    key: string;
    fingerprint: string;
  },
  tx?: DbTransaction,
): Promise<CheckoutIdempotency> {
  return withTransaction(tx, async (executor) => {
    const [row] = await executor
      .insert(checkoutIdempotency)
      .values({
        scope: data.scope,
        key: data.key,
        fingerprint: data.fingerprint,
      })
      .returning();
    return row;
  });
}

export async function recordSuccess(
  id: number,
  data: {
    orderId: number;
    orderReference: string;
    response: CheckoutReceipt;
  },
  tx?: DbTransaction,
): Promise<CheckoutIdempotency> {
  return withTransaction(tx, async (executor) => {
    const [row] = await executor
      .update(checkoutIdempotency)
      .set({
        orderId: data.orderId,
        orderReference: data.orderReference,
        response: data.response,
      })
      .where(eq(checkoutIdempotency.id, id))
      .returning();
    return row;
  });
}

export async function deleteExpired(tx?: DbTransaction): Promise<number> {
  const executor = tx ?? db;
  const deleted = await executor
    .delete(checkoutIdempotency)
    .where(sql`${checkoutIdempotency.createdAt} < now() - interval '24 hours'`)
    .returning({ id: checkoutIdempotency.id });
  return deleted.length;
}
