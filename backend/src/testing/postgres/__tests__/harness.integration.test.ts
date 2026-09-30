import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { brands } from '@findeg/db/schema';
import { connectToTestDatabase, runConcurrently, waitForLockWait, type TestDatabase } from '..';

describe('Postgres integration harness', () => {
  let testDb: TestDatabase;

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it('runs against a fully migrated, isolated database', async () => {
    const [{ name }] = await testDb.sql<{ name: string }[]>`select current_database() as name`;
    expect(name).toMatch(/^findeg_it_/);

    const [{ count }] = await testDb.sql<{ count: number }[]>`
      select count(*)::int as count from drizzle.__drizzle_migrations
    `;
    expect(count).toBeGreaterThan(0);
  });

  it('writes and reads a row through Drizzle', async () => {
    const [inserted] = await testDb.db
      .insert(brands)
      .values({ slug: 'harness-brand', localizedName: { en: 'Harness Brand' } })
      .returning();

    const [read] = await testDb.db.select().from(brands).where(eq(brands.id, inserted.id));
    expect(read.slug).toBe('harness-brand');
  });

  it('blocks a second transaction on SELECT … FOR UPDATE until the first commits', async () => {
    const [brand] = await testDb.db
      .insert(brands)
      .values({ slug: 'locked-brand', localizedName: { en: 'Locked Brand' } })
      .returning();

    const events: string[] = [];

    await runConcurrently(
      async (sql) => {
        await sql.begin(async (tx) => {
          await tx`select id from catalog.brands where id = ${brand.id} for update`;
          events.push('first locked');
          // Hold the lock until the second transaction is provably waiting on it.
          await waitForLockWait(testDb.sql);
          events.push('first committing');
        });
      },
      async (sql) => {
        await waitFor(() => events.includes('first locked'));
        await sql.begin(async (tx) => {
          await tx`select id from catalog.brands where id = ${brand.id} for update`;
          events.push('second locked');
        });
      },
    );

    expect(events).toEqual(['first locked', 'first committing', 'second locked']);
  });
});

async function waitFor(condition: () => boolean): Promise<void> {
  while (!condition()) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}
