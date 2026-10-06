import { PgDialect } from 'drizzle-orm/pg-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { synchronizeSeedSequences, truncateTables } from '../index';

const dialect = new PgDialect();
const schemas = ['identity', 'catalog', 'sales', 'inventory', 'school_engine', 'system'];

function database() {
  const execute = vi.fn().mockResolvedValue([]);
  return {
    execute,
    queries: () =>
      execute.mock.calls.map(([query]) => {
        const compiled = dialect.sqlToQuery(query);
        return { sql: compiled.sql.replace(/\s+/g, ' ').trim(), params: compiled.params };
      }),
  };
}

const sequence = {
  schemaName: 'catalog',
  tableName: 'brands',
  columnName: 'id',
  sequenceName: 'catalog.brands_id_seq',
};

describe('synchronizeSeedSequences', () => {
  it('discovers sequences only in the managed schemas and does nothing for an empty result', async () => {
    const db = database();
    await synchronizeSeedSequences(db);
    expect(db.queries()).toEqual([
      {
        sql: expect.stringContaining('WHERE table_schema IN ($1, $2, $3, $4, $5, $6)'),
        params: schemas,
      },
    ]);
  });

  it('ignores columns without a sequence while repairing the following serial column', async () => {
    const db = database();
    db.execute
      .mockResolvedValueOnce([{ ...sequence, sequenceName: null }, sequence])
      .mockResolvedValueOnce([{ maximum: 42 }]);

    await synchronizeSeedSequences(db);

    expect(db.queries().slice(1)).toEqual([
      { sql: 'SELECT max("id") AS maximum FROM "catalog"."brands"', params: [] },
      {
        sql: 'SELECT setval($1::regclass, $2, $3)',
        params: ['catalog.brands_id_seq', 42, true],
      },
    ]);
  });

  it.each([
    { maximum: null, value: 1, called: false },
    { maximum: 0, value: 0, called: true },
    { maximum: 1, value: 1, called: true },
    { maximum: 2147483647, value: 2147483647, called: true },
  ])(
    'resets a sequence with maximum $maximum using value $value and is_called=$called',
    async ({ maximum, value, called }) => {
      const db = database();
      db.execute.mockResolvedValueOnce([sequence]).mockResolvedValueOnce([{ maximum }]);

      await synchronizeSeedSequences(db);

      expect(db.queries()[2]).toEqual({
        sql: 'SELECT setval($1::regclass, $2, $3)',
        params: [sequence.sequenceName, value, called],
      });
    },
  );

  it('uses each sequence’s own maximum when populated and empty tables are mixed', async () => {
    const db = database();
    db.execute
      .mockResolvedValueOnce([
        sequence,
        {
          ...sequence,
          schemaName: 'sales',
          tableName: 'orders',
          sequenceName: 'sales.orders_id_seq',
        },
      ])
      .mockResolvedValueOnce([{ maximum: 12 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ maximum: null }]);

    await synchronizeSeedSequences(db);

    expect(db.queries().slice(1)).toEqual([
      { sql: 'SELECT max("id") AS maximum FROM "catalog"."brands"', params: [] },
      { sql: 'SELECT setval($1::regclass, $2, $3)', params: ['catalog.brands_id_seq', 12, true] },
      { sql: 'SELECT max("id") AS maximum FROM "sales"."orders"', params: [] },
      { sql: 'SELECT setval($1::regclass, $2, $3)', params: ['sales.orders_id_seq', 1, false] },
    ]);
  });

  it.each(['discovery', 'maximum lookup', 'sequence update'] as const)(
    'propagates a %s failure without processing later sequences',
    async (stage) => {
      const db = database();
      const failure = new Error(`Failed ${stage}`);
      if (stage !== 'discovery') db.execute.mockResolvedValueOnce([sequence, sequence]);
      if (stage === 'sequence update') db.execute.mockResolvedValueOnce([{ maximum: 3 }]);
      db.execute.mockRejectedValueOnce(failure);

      await expect(synchronizeSeedSequences(db)).rejects.toBe(failure);
      expect(db.execute).toHaveBeenCalledTimes(
        { discovery: 1, 'maximum lookup': 2, 'sequence update': 3 }[stage],
      );
    },
  );
});

describe('truncateTables', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('skips empty or absent schemas and still discovers all managed schemas', async () => {
    const db = database();
    await truncateTables(db);
    expect(db.queries()).toEqual(
      schemas.map((schema) => ({
        sql: 'SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = $1',
        params: [schema],
      })),
    );
  });

  it('truncates all discovered tables with identity restart and cascading references', async () => {
    const db = database();
    db.execute
      .mockResolvedValueOnce([{ tablename: 'users' }, { tablename: 'sessions' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ tablename: 'brands' }]);

    await truncateTables(db);

    expect(db.queries().filter((query) => query.sql.startsWith('TRUNCATE'))).toEqual([
      {
        sql: 'TRUNCATE TABLE "identity"."users", "identity"."sessions" RESTART IDENTITY CASCADE',
        params: [],
      },
      { sql: 'TRUNCATE TABLE "catalog"."brands" RESTART IDENTITY CASCADE', params: [] },
    ]);
  });

  it.each(['discovery', 'truncation'])(
    'propagates a %s error instead of continuing or reporting success',
    async (stage) => {
      const db = database();
      const failure = new Error('permission denied');
      if (stage === 'truncation') db.execute.mockResolvedValueOnce([{ tablename: 'users' }]);
      db.execute.mockRejectedValueOnce(failure);

      await expect(truncateTables(db)).rejects.toBe(failure);
      expect(db.execute).toHaveBeenCalledTimes(stage === 'discovery' ? 1 : 2);
      expect(console.log).not.toHaveBeenCalledWith('✅ All tables truncated.');
    },
  );
});
