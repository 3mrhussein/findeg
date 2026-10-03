import { db } from '../../connection';
import { checkoutIdempotency, type CheckoutIdempotency } from '../../schema';
import { eq, and } from 'drizzle-orm';
import { withTransaction, type DbTransaction } from '../transaction';
import type { CheckoutReceipt } from '../../types/sales';

const UNIQUE_VIOLATION = '23505';
const SCOPE_KEY_INDEX = 'uq_checkout_idempotency_scope_key';

/**
 * True when `err` (or anything in its `cause` chain, since drizzle wraps driver errors) is a
 * Postgres unique violation (SQLSTATE 23505) on the (scope, key) index.
 */
export function isScopeKeyConflict(err: unknown): boolean {
  let current: unknown = err;
  for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth++) {
    const e = current as { code?: unknown; constraint_name?: unknown; constraint?: unknown };
    if (
      e.code === UNIQUE_VIOLATION &&
      (e.constraint_name === SCOPE_KEY_INDEX || e.constraint === SCOPE_KEY_INDEX)
    ) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

export async function findByScopeAndKey(
  scope: string,
  key: string,
): Promise<CheckoutIdempotency | null> {
  const [row] = await db
    .select()
    .from(checkoutIdempotency)
    .where(and(eq(checkoutIdempotency.scope, scope), eq(checkoutIdempotency.key, key)))
    .limit(1);

  return row ?? null;
}

/**
 * Claims (scope, key). A concurrent holder makes the insert wait on its transaction, then fail with
 * a unique violation (`isScopeKeyConflict`) if it committed, or succeed if it rolled back.
 */
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
