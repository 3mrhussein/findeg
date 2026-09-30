import { randomBytes } from 'node:crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import type { GlobalSetupContext } from 'vitest/node';
import { migrationsFolder, resolveServerUrl, testDatabasePrefix, withDatabase } from './server';

declare module 'vitest' {
  export interface ProvidedContext {
    integrationDatabaseUrl: string;
  }
}

/**
 * Creates a fresh database for this test run, applies every migration to it,
 * and drops it once the run finishes. Each run gets its own database, so runs
 * never share state.
 */
export default async function setup({ provide }: GlobalSetupContext) {
  const serverUrl = resolveServerUrl();
  const database = `${testDatabasePrefix}${Date.now()}_${randomBytes(4).toString('hex')}`;
  const databaseUrl = withDatabase(serverUrl, database);

  const admin = postgres(serverUrl, { max: 1, onnotice: () => {} });
  await admin`create database ${admin(database)}`;

  const migrator = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(migrator), { migrationsFolder });
  } catch (error) {
    await migrator.end();
    await admin`drop database if exists ${admin(database)} with (force)`;
    await admin.end();
    throw error;
  }
  await migrator.end();

  provide('integrationDatabaseUrl', databaseUrl);

  return async () => {
    await admin`drop database if exists ${admin(database)} with (force)`;
    await admin.end();
  };
}
