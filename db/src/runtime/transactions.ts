import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

/** Infrastructure construction types; never import into application contracts. */
export type TransactionDatabase = Parameters<
  Parameters<ReturnType<typeof drizzle>['transaction']>[0]
>[0];

export interface TransactionDatabaseConfig {
  readonly url: string;
  readonly ssl: boolean;
  readonly max: number;
}

export function createTransactionDatabase(config: TransactionDatabaseConfig) {
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
