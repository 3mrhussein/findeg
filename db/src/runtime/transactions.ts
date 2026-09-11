import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

/** Infrastructure construction types; never import into application contracts. */
export type TransactionDatabase = Parameters<
  Parameters<ReturnType<typeof drizzle>['transaction']>[0]
>[0];

export function createTransactionDatabase(config: { url: string; ssl: boolean; max: number }) {
  const connection = postgres(config.url, {
    max: config.max,
    ssl: config.ssl ? 'verify-full' : false,
    connect_timeout: 10,
    onnotice: () => {},
  });
  const database = drizzle(connection);
  return {
    transaction: <Value>(operation: (transaction: TransactionDatabase) => Promise<Value>) =>
      database.transaction(operation),
    close: () => connection.end({ timeout: 5 }),
  };
}
