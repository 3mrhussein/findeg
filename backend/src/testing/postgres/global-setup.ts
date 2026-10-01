import { randomBytes } from 'node:crypto';
import postgres, { type Sql } from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import type { GlobalSetupContext } from 'vitest/node';
import {
  connectionOptions,
  initScript,
  migrationsFolder,
  resolveServerUrl,
  testDatabasePrefix,
  withDatabase,
} from './server';

declare module 'vitest' {
  export interface ProvidedContext {
    integrationDatabaseUrl: string;
  }
}

/** Databases older than this are leftovers from runs that were killed before teardown. */
const staleAfterMs = 6 * 60 * 60 * 1000;

/**
 * Creates a fresh database for this test run, applies every migration to it,
 * and drops it once the run finishes. Each run gets its own database, so runs
 * never share state.
 */
export default async function setup({ provide }: GlobalSetupContext) {
  const serverUrl = resolveServerUrl();
  const database = `${testDatabasePrefix}${Date.now()}_${randomBytes(4).toString('hex')}`;
  const databaseUrl = withDatabase(serverUrl, database);

  const admin = postgres(serverUrl, { ...connectionOptions, max: 1 });
  const teardown = async () => {
    await dropDatabase(admin, database);
    await admin.end();
  };

  await dropStaleDatabases(admin);
  await admin`create database ${admin(database)}`;

  const migrator = postgres(databaseUrl, { ...connectionOptions, max: 1 });
  try {
    await migrator.file(initScript);
    await migrate(drizzle(migrator), { migrationsFolder });
  } catch (error) {
    await migrator.end();
    await teardown();
    throw error;
  }
  await migrator.end();

  provide('integrationDatabaseUrl', databaseUrl);

  return teardown;
}

async function dropDatabase(admin: Sql, database: string): Promise<void> {
  await admin`drop database if exists ${admin(database)} with (force)`;
}

async function dropStaleDatabases(admin: Sql): Promise<void> {
  const rows = await admin<{ datname: string }[]>`
    select datname from pg_database where datname like ${`${testDatabasePrefix}%`}
  `;
  for (const { datname } of rows) {
    const createdAt = Number(datname.slice(testDatabasePrefix.length).split('_')[0]);
    if (Number.isFinite(createdAt) && Date.now() - createdAt > staleAfterMs) {
      await dropDatabase(admin, datname);
    }
  }
}
