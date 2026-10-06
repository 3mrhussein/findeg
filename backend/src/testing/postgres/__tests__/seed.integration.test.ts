import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { users, brands } from '@findeg/db/schema';
import { truncateTables } from '../../../../../db/seeds/helpers';
import { connectToTestDatabase, type TestDatabase } from '..';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '../../../../..');
const schemas = ['identity', 'catalog', 'sales', 'inventory', 'school_engine', 'system'];

describe('seeded database generated IDs', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    await testDb.sql`create table public.seed_sequence_control (id serial primary key)`;
    await testDb.sql`insert into public.seed_sequence_control (id) values (1000)`;
    await run(process.execPath, [resolve(root, 'db/node_modules/tsx/dist/cli.mjs'), 'seed.ts'], {
      cwd: resolve(root, 'db'),
      env: { ...process.env, DATABASE_URL: inject('integrationDatabaseUrl'), DB_SEEDING: 'true' },
      maxBuffer: 10 * 1024 * 1024,
    });
  });

  afterAll(async () => {
    try {
      await truncateTables(testDb.db);
      await testDb.sql`drop table public.seed_sequence_control`;
    } finally {
      await testDb.close();
    }
  });

  it('accepts a new user and catalog brand without colliding with fixture IDs', async () => {
    const [{ maximum: maxUser }] = await testDb.sql`select max(id) as maximum from identity.users`;
    const [user] = await testDb.db
      .insert(users)
      .values({ email: 'after-seed@example.test' })
      .returning();
    expect(user.id).toBeGreaterThan(maxUser);

    const [{ maximum: maxBrand }] = await testDb.sql`select max(id) as maximum from catalog.brands`;
    const [brand] = await testDb.db
      .insert(brands)
      .values({ slug: 'after-seed', localizedName: { en: 'After seed' } })
      .returning();
    expect(brand.id).toBeGreaterThan(maxBrand);
  });

  it('advances every managed sequence beyond its table rows and preserves empty-table starts', async () => {
    const columns = await testDb.sql<
      { schema: string; table: string; column: string; sequence: string | null }[]
    >`
      select table_schema as schema, table_name as table, column_name as column,
        pg_get_serial_sequence(format('%I.%I', table_schema, table_name), column_name) as sequence
      from information_schema.columns where table_schema = any(${schemas})
    `;
    const sequences = columns.filter((column) => column.sequence !== null);
    expect(sequences.length).toBeGreaterThan(20);
    for (const column of sequences) {
      const [{ maximum }] = await testDb.sql`
        select max(${testDb.sql(column.column)}) as maximum
        from ${testDb.sql(column.schema)}.${testDb.sql(column.table)}
      `;
      const [{ next }] =
        await testDb.sql`select nextval(${column.sequence}::regclass)::int as next`;
      expect(next, `${column.schema}.${column.table}.${column.column}`).toBeGreaterThan(
        maximum ?? 0,
      );
      if (maximum === null) expect(next).toBe(1);
    }
  });

  it('leaves sequences outside the managed seed schemas alone', async () => {
    const [row] =
      await testDb.sql`insert into public.seed_sequence_control default values returning id`;
    expect(row.id).toBe(1);
  });

  it('reports a failed seed command with a nonzero exit status', async () => {
    const missingDatabase = new URL(inject('integrationDatabaseUrl'));
    missingDatabase.pathname = '/findeg_seed_absent';
    await expect(
      run(process.execPath, [resolve(root, 'db/node_modules/tsx/dist/cli.mjs'), 'seed.ts'], {
        cwd: resolve(root, 'db'),
        env: { ...process.env, DATABASE_URL: missingDatabase.toString(), DB_SEEDING: 'true' },
      }),
    ).rejects.toMatchObject({ code: 1, stderr: expect.stringContaining('Seeding failed') });
  });
});
