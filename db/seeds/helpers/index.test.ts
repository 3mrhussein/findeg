import { PgDialect } from 'drizzle-orm/pg-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { synchronizeSeedSequences, truncateTables } from './index';

const schemas = ['identity', 'catalog', 'sales', 'inventory', 'school_engine', 'system'];
const dialect = new PgDialect();
const column = {
  schemaName: 'catalog',
  tableName: 'brands',
  columnName: 'id',
  sequenceName: 'catalog.brands_id_seq',
};

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('synchronizeSeedSequences', () => {
  it('limits discovery to managed schemas and does nothing when none exist', async () => {
    const execute = vi.fn().mockResolvedValue([]);
    await synchronizeSeedSequences({ execute });
    expect(execute).toHaveBeenCalledTimes(1);
    const query = dialect.sqlToQuery(execute.mock.calls[0][0]);
    expect(query.sql).toContain('WHERE table_schema IN');
    expect(query.params).toEqual(schemas);
  });

  it.each([
    { maximum: null, value: 1, isCalled: false },
    { maximum: 42, value: 42, isCalled: true },
    { maximum: 1, value: 1, isCalled: true },
    { maximum: 2147483646, value: 2147483646, isCalled: true },
  ])('repairs a sequence with maximum $maximum', async ({ maximum, value, isCalled }) => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([column])
      .mockResolvedValueOnce([{ maximum }])
      .mockResolvedValueOnce([]);
    await synchronizeSeedSequences({ execute });
    expect(execute).toHaveBeenCalledTimes(3);
    const maximumQuery = dialect.sqlToQuery(execute.mock.calls[1][0]);
    expect(maximumQuery.sql).toContain('max("id")');
    expect(maximumQuery.sql).toContain('FROM "catalog"."brands"');
    const repair = dialect.sqlToQuery(execute.mock.calls[2][0]);
    expect(repair.sql).toContain('setval($1::regclass, $2, $3)');
    expect(repair.params).toEqual([column.sequenceName, value, isCalled]);
  });

  it('skips ordinary columns and repairs each sequence using its own maximum', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([
        { ...column, columnName: 'slug', sequenceName: null },
        column,
        {
          ...column,
          schemaName: 'identity',
          tableName: 'users',
          sequenceName: 'identity.users_id_seq',
        },
      ])
      .mockResolvedValueOnce([{ maximum: 42 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ maximum: null }])
      .mockResolvedValueOnce([]);
    await synchronizeSeedSequences({ execute });
    expect(execute).toHaveBeenCalledTimes(5);
    expect(dialect.sqlToQuery(execute.mock.calls[2][0]).params).toEqual([
      column.sequenceName,
      42,
      true,
    ]);
    expect(dialect.sqlToQuery(execute.mock.calls[3][0]).sql).toContain('FROM "identity"."users"');
    expect(dialect.sqlToQuery(execute.mock.calls[4][0]).params).toEqual([
      'identity.users_id_seq',
      1,
      false,
    ]);
  });

  it.each(['discovery', 'maximum', 'repair'])(
    'propagates a %s failure and stops subsequent repairs',
    async (stage) => {
      const failure = new Error(`Cannot perform ${stage}`);
      const execute = vi.fn();
      if (stage !== 'discovery') execute.mockResolvedValueOnce([column, column]);
      if (stage === 'repair') execute.mockResolvedValueOnce([{ maximum: 42 }]);
      execute.mockRejectedValueOnce(failure);
      await expect(synchronizeSeedSequences({ execute })).rejects.toBe(failure);
      expect(execute).toHaveBeenCalledTimes(['discovery', 'maximum', 'repair'].indexOf(stage) + 1);
    },
  );
});

describe('truncateTables', () => {
  it('checks every managed schema and skips missing or empty schemas', async () => {
    const execute = vi.fn().mockResolvedValue([]);
    await truncateTables({ execute });
    expect(execute).toHaveBeenCalledTimes(schemas.length);
    expect(execute.mock.calls.map(([query]) => dialect.sqlToQuery(query).params)).toEqual(
      schemas.map((schema) => [schema]),
    );
    for (const [query] of execute.mock.calls) {
      expect(dialect.sqlToQuery(query).sql).toContain('WHERE schemaname = $1');
    }
  });

  it('truncates all discovered tables together, restarting identities and cascading dependencies', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ tablename: 'brands' }, { tablename: 'order' }])
      .mockResolvedValue([]);
    await truncateTables({ execute });
    expect(execute).toHaveBeenCalledTimes(schemas.length + 1);
    expect(dialect.sqlToQuery(execute.mock.calls[2][0]).sql).toBe(
      'TRUNCATE TABLE "catalog"."brands", "catalog"."order" RESTART IDENTITY CASCADE',
    );
    expect(dialect.sqlToQuery(execute.mock.calls[3][0]).params).toEqual(['sales']);
  });

  it.each(['discovery', 'truncation'])(
    'propagates a %s failure instead of reporting success',
    async (stage) => {
      const failure = new Error('permission denied');
      const execute = vi.fn();
      if (stage === 'truncation') execute.mockResolvedValueOnce([{ tablename: 'users' }]);
      execute.mockRejectedValueOnce(failure);
      await expect(truncateTables({ execute })).rejects.toBe(failure);
      expect(execute).toHaveBeenCalledTimes(stage === 'discovery' ? 1 : 2);
      expect(console.log).not.toHaveBeenCalledWith('✅ All tables truncated.');
    },
  );
});
