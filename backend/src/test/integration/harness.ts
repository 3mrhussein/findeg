import postgres from 'postgres';
import { inject } from 'vitest';

export type Sql = postgres.Sql;

/** Opens a dedicated connection (one session) to the run's migrated database. */
export function connect(): Sql {
  return postgres(inject('integrationDatabaseUrl'), { max: 1, onnotice: () => {} });
}

/**
 * Runs each operation at the same time, every one on its own connection, so
 * tests can reproduce races. Connections are closed when all settle.
 */
export async function runConcurrently<T extends readonly unknown[]>(operations: {
  [K in keyof T]: (sql: Sql) => Promise<T[K]>;
}): Promise<T> {
  const connections = operations.map(() => connect());
  try {
    return (await Promise.all(
      operations.map((operation, i) => operation(connections[i])),
    )) as unknown as T;
  } finally {
    await Promise.all(connections.map((sql) => sql.end()));
  }
}

/** A promise settled from outside, for ordering steps across connections. */
export function deferred<T = void>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}
