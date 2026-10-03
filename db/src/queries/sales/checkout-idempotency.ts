import { db } from '../../connection';
import { checkoutIdempotency, type CheckoutIdempotency } from '../../schema';
import { eq, and, sql } from 'drizzle-orm';
import { withTransaction, type DbTransaction } from '../transaction';
import type { CheckoutReceipt } from '../../types/sales';

/** Rows older than this are expired: invisible to lookups and recycled by `claimKey` (ADR-0005). */
export const IDEMPOTENCY_RETENTION_HOURS = 24;
const retentionCutoff = sql.raw(`now() - interval '${IDEMPOTENCY_RETENTION_HOURS} hours'`);

const UNIQUE_VIOLATION = '23505';
const SCOPE_KEY_INDEX = 'uq_checkout_idempotency_scope_key';

/**
 * True when `err` (or anything in its `cause` chain, since drizzle wraps driver errors) is a
 * Postgres unique violation (SQLSTATE 23505) on the (scope, key) index.
 */
export function isScopeKeyConflict(err: unknown): boolean {
  if (err instanceof ScopeKeyConflictError) return true;
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
    .where(
      and(
        eq(checkoutIdempotency.scope, scope),
        eq(checkoutIdempotency.key, key),
        sql`${checkoutIdempotency.createdAt} >= ${retentionCutoff}`,
      ),
    )
    .limit(1);

  return row ?? null;
}

/**
 * Thrown by `claimKey` when a live (unexpired) row already holds the (scope, key).
 * Treated like a unique violation by `isScopeKeyConflict`.
 */
export class ScopeKeyConflictError extends Error {
  constructor() {
    super(`Idempotency key already in use (${SCOPE_KEY_INDEX})`);
    this.name = 'ScopeKeyConflictError';
  }
}

/**
 * Claims (scope, key) in a single atomic statement. An expired row for the same key is recycled in
 * place (no separate delete, so concurrent claimers can't interleave); a live row, whether
 * committed or still held by an in-flight transaction, yields `ScopeKeyConflictError`. If the
 * in-flight holder rolls back, the insert simply succeeds.
 */
export async function claimKey(
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
      .onConflictDoUpdate({
        target: [checkoutIdempotency.scope, checkoutIdempotency.key],
        set: {
          fingerprint: data.fingerprint,
          orderId: null,
          orderReference: null,
          response: null,
          createdAt: sql`now()`,
        },
        setWhere: sql`${checkoutIdempotency.createdAt} < ${retentionCutoff}`,
      })
      .returning();
    if (!row) throw new ScopeKeyConflictError();
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

/** Deletes rows past the retention window; the Order remains the durable record (ADR-0005). */
export async function purgeExpired(): Promise<number> {
  const rows = await db
    .delete(checkoutIdempotency)
    .where(sql`${checkoutIdempotency.createdAt} < ${retentionCutoff}`)
    .returning({ id: checkoutIdempotency.id });
  return rows.length;
}
