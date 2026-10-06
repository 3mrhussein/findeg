import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { sql, type Table, type InferInsertModel } from 'drizzle-orm';
import type { Db } from '../../src/connection';

type SeedDatabase = Pick<Db, 'execute'>;

const managedSchemas = ['identity', 'catalog', 'sales', 'inventory', 'school_engine', 'system'];

/**
 * Repair sequences in the managed seed schemas after inserting explicit fixture IDs.
 * Set each associated sequence to its column's maximum value; an empty column starts at 1
 * on the next allocation. Columns without an associated sequence are skipped.
 * Database errors reject the promise; earlier sequence updates are not undone here.
 */
export async function synchronizeSeedSequences(db: SeedDatabase): Promise<void> {
  const columns = (await db.execute(sql`
    SELECT table_schema AS "schemaName", table_name AS "tableName", column_name AS "columnName",
      pg_get_serial_sequence(format('%I.%I', table_schema, table_name), column_name) AS "sequenceName"
    FROM information_schema.columns
    WHERE table_schema IN (${sql.join(
      managedSchemas.map((name) => sql`${name}`),
      sql`, `,
    )})
  `)) as {
    schemaName: string;
    tableName: string;
    columnName: string;
    sequenceName: string | null;
  }[];

  for (const column of columns) {
    if (!column.sequenceName) continue;
    const [{ maximum }] = (await db.execute(sql`
      SELECT max(${sql.identifier(column.columnName)}) AS maximum
      FROM ${sql.identifier(column.schemaName)}.${sql.identifier(column.tableName)}
    `)) as { maximum: number | null }[];
    // Empty tables retain the first value (1); populated tables allocate max + 1 next.
    await db.execute(sql`
      SELECT setval(${column.sequenceName}::regclass, ${maximum ?? 1}, ${maximum !== null})
    `);
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 12);
}

/**
 * Require at least one row in each parent table before inserting dependent fixtures.
 * Each `name` is a trusted, SQL-ready table reference, including any schema and quoting;
 * the optional `table` field is unused. An empty parent list requires no queries.
 * Rejects on the first empty table or database error.
 */
export async function ensureParents(
  db: SeedDatabase,
  parents: { name: string; table?: Table }[],
): Promise<void> {
  for (const parent of parents) {
    const result = (await db.execute(sql.raw(`SELECT count(*) as count FROM ${parent.name}`))) as {
      count: string;
    }[];
    const count = Number(result[0].count);
    if (count === 0) {
      throw new Error(
        `❌ Structural Seeding Error: Parent table "${parent.name}" is empty. Please seed it before proceeding.`,
      );
    }
  }
}

export type ProcessedSeed<T> = {
  [K in keyof T]: T[K] extends string
    ? K extends `${string}At` | 'emailVerified' | 'expires'
      ? Date | null
      : T[K]
    : T[K];
};

export function prepareSeedData<TTable extends Table>(
  table: TTable,
  data: Record<string, unknown>[],
  schema?: z.ZodSchema,
): InferInsertModel<TTable>[] {
  return data.map((item, index) => {
    // Optional schema validation
    if (schema) {
      const result = schema.safeParse(item);
      if (!result.success) {
        const firstError = result.error.issues[0];
        throw new Error(
          `❌ Seed Validation Error at index ${index}: [${firstError.path.join('.')}] ${firstError.message}`,
        );
      }
    }

    const newItem = { ...item };
    for (const key in newItem) {
      const val = newItem[key];
      // Convert date strings
      if (
        (key.endsWith('At') ||
          key.endsWith('Date') ||
          key === 'emailVerified' ||
          key === 'expires') &&
        typeof val === 'string'
      ) {
        newItem[key] = new Date(val);
      }
      // Convert numbers to strings for Drizzle Decimal/Numeric types
      if (
        typeof val === 'number' &&
        (key.endsWith('Price') ||
          key.endsWith('Amount') ||
          key.endsWith('Cost') ||
          key.endsWith('Rate') ||
          key.endsWith('factorToBase') ||
          key === 'rating' ||
          key === 'totalPrice' ||
          key === 'valueNum')
      ) {
        newItem[key] = val.toString();
      }
    }
    return newItem as InferInsertModel<TTable>;
  });
}

/**
 * Empty all tables in the managed seed schemas and restart their owned sequences.
 * Cascades to tables with foreign keys referencing them, including outside those schemas.
 * Missing or empty schemas are skipped. Database errors reject the promise; completed
 * truncations are not rolled back here.
 */
export async function truncateTables(db: SeedDatabase) {
  console.log('🧹 Truncating tables securely across all schemas...');

  for (const schemaName of managedSchemas) {
    // A missing schema has no rows; permission and truncation failures must propagate.
    const tables = (await db.execute(sql`
      SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = ${schemaName}
    `)) as { tablename: string }[];

    if (tables.length > 0) {
      const tableNames = tables.map(
        (table) => sql`${sql.identifier(schemaName)}.${sql.identifier(table.tablename)}`,
      );
      console.log(`  - Truncating ${tables.length} tables in schema "${schemaName}"...`);
      await db.execute(
        sql`TRUNCATE TABLE ${sql.join(tableNames, sql`, `)} RESTART IDENTITY CASCADE`,
      );
    }
  }

  console.log('✅ All tables truncated.');
}
