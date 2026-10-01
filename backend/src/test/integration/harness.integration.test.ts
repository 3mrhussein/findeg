import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { connect, deferred, runConcurrently, type Sql } from './harness';

describe('integration harness', () => {
  let sql: Sql;

  beforeAll(async () => {
    sql = connect();
    await sql`CREATE TABLE harness_smoke (id integer PRIMARY KEY, value text NOT NULL)`;
  });

  afterAll(async () => {
    await sql.end();
  });

  it('runs against a fully migrated database', async () => {
    const [{ count }] = await sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM information_schema.tables
      WHERE table_schema = 'identity' AND table_name = 'users'`;
    expect(count).toBe(1);
  });

  it('writes and reads a row', async () => {
    await sql`INSERT INTO harness_smoke (id, value) VALUES (1, 'hello')`;
    const rows = await sql`SELECT value FROM harness_smoke WHERE id = 1`;
    expect(rows.map((r) => r.value)).toEqual(['hello']);
  });

  it('blocks a second transaction on SELECT … FOR UPDATE until the first commits', async () => {
    await sql`INSERT INTO harness_smoke (id, value) VALUES (2, 'locked')`;

    const firstHoldsLock = deferred();
    const releaseFirst = deferred();
    const order: string[] = [];

    await runConcurrently([
      (conn) =>
        conn.begin(async (tx) => {
          await tx`SELECT * FROM harness_smoke WHERE id = 2 FOR UPDATE`;
          firstHoldsLock.resolve();
          await releaseFirst.promise;
          order.push('first commits');
        }),
      async (conn) => {
        await firstHoldsLock.promise;
        const [{ pid }] = await conn<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`;
        await conn.begin(async (tx) => {
          const pending = tx`SELECT * FROM harness_smoke WHERE id = 2 FOR UPDATE`.then(() => {
            order.push('second acquires');
          });
          try {
            // The second session must show up as waiting on a lock, not finish.
            await vi.waitFor(async () => {
              const [row] = await sql`
                SELECT wait_event_type FROM pg_stat_activity WHERE pid = ${pid}`;
              expect(row?.wait_event_type).toBe('Lock');
            });
            expect(order).toEqual([]);
          } finally {
            // Always let the first transaction finish, or a failed assertion would hang.
            releaseFirst.resolve();
          }
          await pending;
        });
      },
    ]);

    expect(order).toEqual(['first commits', 'second acquires']);
  });
});
