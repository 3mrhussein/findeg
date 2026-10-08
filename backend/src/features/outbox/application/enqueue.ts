import { enqueue as enqueueOnTransaction, type DbTransaction } from '@findeg/db/queries/outbox';

/**
 * Writes an outbox message on the caller's transaction, so it commits or rolls back with the
 * business change. `id` must be derived from the business fact (`order-accepted:<ref>`); enqueueing
 * the same id twice is a no-op. `payload` holds ids only (ADR-0008).
 */
export function enqueue(
  tx: DbTransaction,
  id: string,
  kind: string,
  payload: Record<string, unknown>,
): Promise<void> {
  return enqueueOnTransaction(tx, id, kind, payload);
}
