/**
 * Outbox producer entry (`@findeg/db/queries/outbox`, ADR-0008).
 *
 * Connection-free: it imports neither the default connection nor the application
 * environment, so a producer such as Orders can enqueue on the transaction it already owns.
 * Claiming, delivery bookkeeping and retries are worker queries; they stay in
 * `outboxQueries` (`@findeg/db/queries`), which uses the default connection.
 */

import { outbox } from '../../schema/system/outbox';
import type { DbTransaction } from '../db-transaction';

export type { DbTransaction };

/**
 * Inserts an outbox message on the caller's transaction, so it commits or rolls back with the
 * business change. `id` is derived from the business fact (e.g. `order-status:<ref>:<status>`):
 * enqueueing an id that already exists is a no-op, also within the same transaction.
 * `payload` holds ids only.
 */
export async function enqueue(
  tx: DbTransaction,
  id: string,
  kind: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!tx) throw new TypeError("Outbox enqueue requires the caller's transaction.");
  await tx.insert(outbox).values({ id, kind, payload }).onConflictDoNothing();
}
