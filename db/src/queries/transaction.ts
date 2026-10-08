/**
 * Optional-transaction plumbing for query primitives that take part in a
 * caller-owned transaction (e.g. Order Acceptance, ADR-0005).
 */

import { db } from '../connection';
import type { DbTransaction } from './db-transaction';

export type { DbTransaction };

// `db-transaction.ts` spells the type out without importing the connection; this fails to
// compile if it ever drifts from the handle `db.transaction` actually passes.
type ConnectionTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const sameTransactionType: Same<DbTransaction, ConnectionTransaction> = true;
void sameTransactionType;

/**
 * Runs `work` on `tx` when the caller supplied one, otherwise in a new
 * transaction of its own, so a query behaves the same with or without `tx`.
 */
export function withTransaction<T>(
  tx: DbTransaction | undefined,
  work: (executor: DbTransaction) => Promise<T>,
): Promise<T> {
  return tx ? work(tx) : db.transaction(work);
}
