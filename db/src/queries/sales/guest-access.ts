/**
 * Query Primitives for Guest Order Access (ADR-0008)
 *
 * Limits and expiry are evaluated in SQL against `now()`, so every caller sees one clock.
 */

import { and, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { db } from '../../connection';
import {
  guestAccessCodes,
  guestAccessRequests,
  orders,
  type GuestAccessRequest,
} from '../../schema';
import { withTransaction, type DbTransaction } from '../transaction';

export const GUEST_ACCESS_TTL_MINUTES = 15;
export const GUEST_ACCESS_MAX_ATTEMPTS = 5;
export const GUEST_ACCESS_MAX_REQUESTS_PER_HOUR = 3;

const live = and(
  isNull(guestAccessRequests.consumedAt),
  gt(guestAccessRequests.expiresAt, sql`now()`),
  lt(guestAccessRequests.attempts, GUEST_ACCESS_MAX_ATTEMPTS),
);

/** The Order a guest may request access to: reference and checkout email must both match. */
export async function findGuestOrder(
  reference: string,
  email: string,
  tx?: DbTransaction,
): Promise<{ id: number; orderReference: string } | null> {
  return withTransaction(tx, async (executor) => {
    const [row] = await executor
      .select({ id: orders.id, orderReference: orders.orderReference })
      .from(orders)
      .where(and(eq(orders.orderReference, reference), sql`lower(${orders.guestEmail}) = ${email}`))
      .limit(1);
    return row ?? null;
  });
}

export async function findOrderIdByReference(
  reference: string,
  tx?: DbTransaction,
): Promise<number | null> {
  return withTransaction(tx, async (executor) => {
    const [row] = await executor
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.orderReference, reference))
      .limit(1);
    return row?.id ?? null;
  });
}

/**
 * Creates a request unless the Order already has `GUEST_ACCESS_MAX_REQUESTS_PER_HOUR` requests in
 * the last hour (counted from the request rows). The Order row is locked first, so concurrent
 * lookups can't both slip under the limit. Returns null when the limit is reached.
 */
export async function createRequest(
  orderId: number,
  tx: DbTransaction,
): Promise<GuestAccessRequest | null> {
  await tx.select({ id: orders.id }).from(orders).where(eq(orders.id, orderId)).for('update');

  const [{ count }] = await tx
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(guestAccessRequests)
    .where(
      and(
        eq(guestAccessRequests.orderId, orderId),
        sql`${guestAccessRequests.createdAt} > now() - interval '1 hour'`,
      ),
    );
  if (count >= GUEST_ACCESS_MAX_REQUESTS_PER_HOUR) return null;

  const [row] = await tx
    .insert(guestAccessRequests)
    .values({
      orderId,
      expiresAt: sql`now() + make_interval(mins => ${GUEST_ACCESS_TTL_MINUTES})`,
    })
    .returning();
  return row;
}

/**
 * Returns the request with the Order's reference and guest email, only while the request is still
 * usable (not consumed, expired or out of attempts).
 */
export async function findLiveRequest(
  id: string,
): Promise<(GuestAccessRequest & { orderReference: string; guestEmail: string | null }) | null> {
  const [row] = await db
    .select({
      request: guestAccessRequests,
      orderReference: orders.orderReference,
      guestEmail: orders.guestEmail,
    })
    .from(guestAccessRequests)
    .innerJoin(orders, eq(orders.id, guestAccessRequests.orderId))
    .where(and(eq(guestAccessRequests.id, id), live))
    .limit(1);
  return row
    ? { ...row.request, orderReference: row.orderReference, guestEmail: row.guestEmail }
    : null;
}

/** Stores one more code hash for the request; storing the same hash twice is a no-op. */
export async function addCodeHash(requestId: string, codeHash: string): Promise<void> {
  await db.insert(guestAccessCodes).values({ requestId, codeHash }).onConflictDoNothing();
}

/**
 * Counts one verification attempt against every live request of the Order, then consumes the
 * first request whose stored code hashes satisfy `matches`. Runs in a transaction that locks the
 * live requests, so concurrent guesses can't exceed the attempt limit and one code can't be used
 * twice. Returns whether a code matched.
 */
export async function attemptVerification(
  orderId: number,
  matches: (requestId: string, storedHashes: string[]) => boolean,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const requests = await tx
      .select({ id: guestAccessRequests.id })
      .from(guestAccessRequests)
      .where(and(eq(guestAccessRequests.orderId, orderId), live))
      .for('update');

    let matched: string | null = null;
    for (const { id } of requests) {
      await tx
        .update(guestAccessRequests)
        .set({ attempts: sql`${guestAccessRequests.attempts} + 1` })
        .where(eq(guestAccessRequests.id, id));

      const stored = await tx
        .select({ codeHash: guestAccessCodes.codeHash })
        .from(guestAccessCodes)
        .where(eq(guestAccessCodes.requestId, id));
      if (
        !matched &&
        matches(
          id,
          stored.map((c) => c.codeHash),
        )
      )
        matched = id;
    }

    if (!matched) return false;
    await tx
      .update(guestAccessRequests)
      .set({ consumedAt: sql`now()` })
      .where(eq(guestAccessRequests.id, matched));
    return true;
  });
}
