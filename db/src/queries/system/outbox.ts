/**
 * Query Primitives for the Outbox (ADR-0008)
 *
 * Claiming uses `FOR UPDATE SKIP LOCKED` with a lease; every completion is guarded by the lease
 * token, so a drain whose lease was reclaimed can never overwrite the new owner's outcome.
 */

import { randomUUID } from 'node:crypto';
import { and, desc, eq, lt, or, sql } from 'drizzle-orm';
import { db } from '../../connection';
import { outbox, OUTBOX_STATUSES, type OutboxRow, type OutboxStatus } from '../../schema';
import { withTransaction, type DbTransaction } from '../transaction';

export const OUTBOX_LEASE_SECONDS = 60;
export const OUTBOX_MAX_ATTEMPTS = 8;
const BACKOFF_BASE_SECONDS = 30;
const BACKOFF_CAP_SECONDS = 3600;
export const OUTBOX_DELIVERED_RETENTION_DAYS = 30;

/** Seconds to wait before retrying after `attempts` failed attempts: 30s × 2^(n-1), capped at 1h. */
export function backoffSeconds(attempts: number): number {
  const exponent = Math.max(attempts - 1, 0);
  return Math.min(BACKOFF_BASE_SECONDS * 2 ** exponent, BACKOFF_CAP_SECONDS);
}

/** The producer lives in the connection-free `@findeg/db/queries/outbox` entry. */
export { enqueue } from '../outbox';

export interface ClaimedOutboxRow {
  row: OutboxRow;
  leaseToken: string;
}

/**
 * Claims one due row: `pending` and due, or `processing` with an expired lease (a crashed or slow
 * drain). The claim counts as an attempt. Returns null when nothing is due.
 */
export async function claimNext(): Promise<ClaimedOutboxRow | null> {
  const leaseToken = randomUUID();
  return db.transaction(async (tx) => {
    const [due] = await tx
      .select({ id: outbox.id })
      .from(outbox)
      .where(
        or(
          and(eq(outbox.status, 'pending'), sql`${outbox.nextAttemptAt} <= now()`),
          and(eq(outbox.status, 'processing'), sql`${outbox.leaseUntil} < now()`),
        ),
      )
      .orderBy(outbox.nextAttemptAt)
      .limit(1)
      .for('update', { skipLocked: true });
    if (!due) return null;

    const [row] = await tx
      .update(outbox)
      .set({
        status: 'processing',
        attempts: sql`${outbox.attempts} + 1`,
        leaseToken,
        leaseUntil: sql`now() + make_interval(secs => ${OUTBOX_LEASE_SECONDS})`,
      })
      .where(eq(outbox.id, due.id))
      .returning();
    return { row, leaseToken };
  });
}

const leased = (id: string, leaseToken: string) =>
  and(eq(outbox.id, id), eq(outbox.leaseToken, leaseToken), eq(outbox.status, 'processing'));

/** Returns false when the lease was lost (the row now belongs to someone else). */
export async function markDelivered(id: string, leaseToken: string): Promise<boolean> {
  const rows = await db
    .update(outbox)
    .set({ status: 'delivered', deliveredAt: sql`now()`, leaseToken: null, leaseUntil: null })
    .where(leased(id, leaseToken))
    .returning({ id: outbox.id });
  return rows.length > 0;
}

/** Terminal outcome without sending (`expired`). */
export async function markExpired(id: string, leaseToken: string): Promise<boolean> {
  const rows = await db
    .update(outbox)
    .set({ status: 'expired', leaseToken: null, leaseUntil: null })
    .where(leased(id, leaseToken))
    .returning({ id: outbox.id });
  return rows.length > 0;
}

/**
 * Records a failed attempt: schedules the retry with backoff, or marks the row `exhausted` once
 * `OUTBOX_MAX_ATTEMPTS` attempts have been made.
 */
export async function markFailed(
  id: string,
  leaseToken: string,
  attempts: number,
  error: string,
): Promise<boolean> {
  const exhausted = attempts >= OUTBOX_MAX_ATTEMPTS;
  const rows = await db
    .update(outbox)
    .set({
      status: exhausted ? 'exhausted' : 'pending',
      lastError: error.slice(0, 2000),
      nextAttemptAt: exhausted
        ? sql`${outbox.nextAttemptAt}`
        : sql`now() + make_interval(secs => ${backoffSeconds(attempts)})`,
      leaseToken: null,
      leaseUntil: null,
    })
    .where(leased(id, leaseToken))
    .returning({ id: outbox.id });
  return rows.length > 0;
}

/** Deletes `delivered` rows past retention. `exhausted` rows are kept for investigation. */
export async function purgeDelivered(): Promise<number> {
  const rows = await db
    .delete(outbox)
    .where(
      and(
        eq(outbox.status, 'delivered'),
        lt(
          outbox.deliveredAt,
          sql`now() - make_interval(days => ${OUTBOX_DELIVERED_RETENTION_DAYS})`,
        ),
      ),
    )
    .returning({ id: outbox.id });
  return rows.length;
}

export async function countByStatus(): Promise<Record<OutboxStatus, number>> {
  const rows = await db
    .select({ status: outbox.status, count: sql<number>`cast(count(*) as integer)` })
    .from(outbox)
    .groupBy(outbox.status);
  const counts = Object.fromEntries(OUTBOX_STATUSES.map((s) => [s, 0])) as Record<
    OutboxStatus,
    number
  >;
  for (const r of rows) counts[r.status] = r.count;
  return counts;
}

export async function getById(id: string, tx?: DbTransaction): Promise<OutboxRow | null> {
  return withTransaction(tx, async (executor) => {
    const [row] = await executor.select().from(outbox).where(eq(outbox.id, id));
    return row ?? null;
  });
}

/** Exhausted rows, newest first. */
export async function listExhausted(limit = 50): Promise<OutboxRow[]> {
  return db
    .select()
    .from(outbox)
    .where(eq(outbox.status, 'exhausted'))
    .orderBy(desc(outbox.createdAt))
    .limit(limit);
}

/** Staff retry: puts an exhausted row back in the queue with a fresh attempt budget. */
export async function requeueExhausted(id: string): Promise<boolean> {
  const rows = await db
    .update(outbox)
    .set({ status: 'pending', attempts: 0, nextAttemptAt: sql`now()` })
    .where(and(eq(outbox.id, id), eq(outbox.status, 'exhausted')))
    .returning({ id: outbox.id });
  return rows.length > 0;
}
