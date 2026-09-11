import type { TransactionRunner, TransactionOutcome } from '@findeg/backend/transactions';
import {
  createTransactionDatabase,
  type TransactionDatabase,
  type TransactionDatabaseConfig,
} from '@findeg/db/transactions';

/** Concrete construction belongs to runtime; callers receive only the application runner. */
export function createTransactionRuntime<Adapters>(
  config: TransactionDatabaseConfig,
  bind: (database: TransactionDatabase) => Adapters,
): { transactions: TransactionRunner<Adapters>; close: () => Promise<void> } {
  const database = createTransactionDatabase(config);
  return {
    transactions: {
      async run<Value, Rejection>(
        operation: (adapters: Adapters) => Promise<TransactionOutcome<Value, Rejection>>,
      ) {
        // Local to this run: a rejection from another concurrent run cannot be mistaken for ours.
        class BusinessRejection extends Error {
          constructor(readonly outcome: TransactionOutcome<Value, Rejection>) {
            super('Transaction rejected');
          }
        }
        try {
          return await database.transaction(async (transaction) => {
            const outcome = await operation(bind(transaction));
            if (!outcome.ok) throw new BusinessRejection(outcome);
            return outcome;
          });
        } catch (error) {
          if (error instanceof BusinessRejection) return error.outcome;
          throw error;
        }
      },
    },
    close: database.close,
  };
}
