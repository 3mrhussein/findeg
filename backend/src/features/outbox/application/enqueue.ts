import { outbox } from '@findeg/db/schema';
import type { Db } from '@findeg/db/connection';
type DbTransaction = Parameters<Parameters<Db['transaction']>[0]>[0];

/**
 * Writes an outbox message on the caller's transaction, so it commits or rolls back with the
 * business change. `id` must be derived from the business fact (`order-accepted:<ref>`); enqueueing
 * the same id twice is a no-op. `payload` holds ids only (ADR-0008).
 */
export async function enqueue(
  tx: DbTransaction,
  id: string,
  kind: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await tx.insert(outbox).values({ id, kind, payload }).onConflictDoNothing();
}
