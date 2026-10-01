import postgres, { type Sql } from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@findeg/db/schema';
import { inject } from 'vitest';
import { connectionOptions } from './server';

/**
 * Helpers for `*.integration.test.ts` files. The database behind them is created
 * and migrated once per run by `global-setup.ts`; run with `pnpm test:integration`.
 */

export interface TestDatabase {
  sql: Sql;
  db: PostgresJsDatabase<typeof schema>;
  close(): Promise<void>;
}

/** The other side of a `runConcurrently` pair. */
export interface Peer {
  /** Postgres backend pid of the peer's connection, for `waitUntilBlocked`. */
  pid: number;
}

function openConnection(options: postgres.Options<Record<string, never>> = {}): Sql {
  return postgres(inject('integrationDatabaseUrl'), { ...connectionOptions, ...options });
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
 * lock contention. Each operation is told its peer's backend pid. Both
 * connections are closed afterwards; if one operation fails, closing its
 * peer's connection unblocks anything still waiting.
 */
export async function runConcurrently<A, B>(
  first: (sql: Sql, peer: Peer) => Promise<A>,
  second: (sql: Sql, peer: Peer) => Promise<B>,
): Promise<[A, B]> {
  const connections = [openConnection({ max: 1 }), openConnection({ max: 1 })] as const;
  try {
    const [firstPid, secondPid] = await Promise.all(connections.map(backendPid));
    return await Promise.all([
      first(connections[0], { pid: secondPid }),
      second(connections[1], { pid: firstPid }),
    ]);
  } finally {
    await Promise.all(connections.map((connection) => connection.end({ timeout: 1 })));
  }
}

async function backendPid(sql: Sql): Promise<number> {
  const [{ pid }] = await sql<{ pid: number }[]>`select pg_backend_pid() as pid`;
  return pid;
}

const blockedTimeoutMs = 5_000;

/**
 * Resolves once the backend `pid` is blocked waiting for a lock held by another
 * backend (e.g. queued behind `SELECT … FOR UPDATE`). Use it to hold a lock until
 * a concurrent transaction has provably queued behind it.
 */
export async function waitUntilBlocked(observer: Sql, pid: number): Promise<void> {
  const deadline = Date.now() + blockedTimeoutMs;
  while (Date.now() < deadline) {
    const [{ blocked }] = await observer<{ blocked: boolean }[]>`
      select cardinality(pg_blocking_pids(${pid}::int)) > 0 as blocked
    `;
    if (blocked) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Backend ${pid} was not blocked on a lock within ${blockedTimeoutMs}ms`);
}
