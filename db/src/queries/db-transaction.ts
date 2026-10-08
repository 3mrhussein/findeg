/**
 * The transaction handle `db.transaction` passes to its callback, spelled out from the schema
 * so connection-free entries (e.g. `@findeg/db/queries/outbox`) can name it without importing
 * the default connection or the application environment.
 */

import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type * as schema from '../schema';

export type DbTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
