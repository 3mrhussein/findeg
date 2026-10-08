/**
 * Optional-transaction plumbing for query primitives that take part in a
 * caller-owned transaction (e.g. Order Acceptance, ADR-0005).
 */

import type { Db } from '../connection';

/** The transaction handle `db.transaction` passes to its callback. */
export type DbTransaction = Parameters<Parameters<Db['transaction']>[0]>[0];

/**
 * Runs `work` on `tx` when the caller supplied one, otherwise in a new
 * transaction of its own, so a query behaves the same with or without `tx`.
 */
export async function withTransaction<T>(
  tx: DbTransaction | undefined,
  work: (executor: DbTransaction) => Promise<T>,
): Promise<T> {
  if (tx) return work(tx);
  const { db } = await import('../connection');
  return db.transaction(work);
}
