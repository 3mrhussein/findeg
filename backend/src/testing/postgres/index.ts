import postgres, { type Sql } from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@findeg/db/schema';
import { inject } from 'vitest';

/**
 * Helpers for `*.integration.test.ts` files. The database behind them is created
 * and migrated once per run by `global-setup.ts`; run with
 * `pnpm --filter @findeg/backend test:integration`.
 */

export interface TestDatabase {
  sql: Sql;
  db: PostgresJsDatabase<typeof schema>;
  close(): Promise<void>;
}

function openConnection(options: postgres.Options<Record<string, never>> = {}): Sql {
  return postgres(inject('integrationDatabaseUrl'), { onnotice: () => {}, ...options });
}

/** A pooled connection to this run's migrated test database. Call `close()` in `afterAll`. */
export function connectToTestDatabase(): TestDatabase {
  const sql = openConnection();
  return {
    sql,
    db: drizzle(sql, { schema }),
    close: () => sql.end({ timeout: 5 }),
  };
}

/**
 * Runs two operations at the same time, each on its own dedicated database
 * connection (a separate Postgres backend), so tests can reproduce races and
 * lock contention. Both connections are closed afterwards; if one operation
 * fails, closing its peer's connection unblocks anything still waiting.
 */
export async function runConcurrently<A, B>(
  first: (sql: Sql) => Promise<A>,
  second: (sql: Sql) => Promise<B>,
): Promise<[A, B]> {
  const connections = [openConnection({ max: 1 }), openConnection({ max: 1 })] as const;
  try {
    return await Promise.all([first(connections[0]), second(connections[1])]);
  } finally {
    await Promise.all(connections.map((connection) => connection.end({ timeout: 1 })));
  }
}

/**
 * Resolves once another backend on this database is waiting to acquire a lock
 * (e.g. blocked on `SELECT … FOR UPDATE`). Use it to hold a lock until a
 * concurrent transaction has provably queued behind it.
 */
export async function waitForLockWait(observer: Sql, { timeoutMs = 5_000 } = {}): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const waiting = await observer`
      select 1 from pg_stat_activity
      where datname = current_database()
        and pid <> pg_backend_pid()
        and wait_event_type = 'Lock'
    `;
    if (waiting.length > 0) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`No backend waited on a lock within ${timeoutMs}ms`);
}
