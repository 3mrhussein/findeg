import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import type { GlobalSetupContext } from 'vitest/node';

const MIGRATIONS_FOLDER = resolve(import.meta.dirname, '../../../../db/migrations');

/**
 * Connection URL of a server (and any database on it) where the harness may
 * `CREATE DATABASE`. Defaults to the docker-compose Postgres service.
 */
function adminUrl(): URL {
  try {
    // Same DB_* values the docker-compose service uses; already-set variables win.
    process.loadEnvFile(resolve(import.meta.dirname, '../../../../.env'));
  } catch {
    // No .env (e.g. CI): fall back to the defaults below.
  }

  const explicit = process.env.INTEGRATION_DATABASE_URL;
  if (explicit) return new URL(explicit);

  const user = process.env.DB_USER ?? 'findeg';
  const password = process.env.DB_PASSWORD ?? 'strongpassword';
  const port = process.env.DB_PORT ?? '5432';
  return new URL(
    `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@localhost:${port}/postgres`,
  );
}

declare module 'vitest' {
  export interface ProvidedContext {
    integrationDatabaseUrl: string;
  }
}

/**
 * Creates a fresh, fully migrated database for this run and drops it again
 * afterwards, so runs never leak state into each other.
 */
export default async function setup({ provide }: GlobalSetupContext) {
  const admin = adminUrl();
  const databaseName = `findeg_it_${randomBytes(6).toString('hex')}`;

  const adminSql = postgres(admin.toString(), { max: 1, onnotice: () => {} });
  try {
    await adminSql.unsafe(`CREATE DATABASE "${databaseName}"`);
  } catch (error) {
    await adminSql.end();
    throw new Error(
      `Integration tests need a reachable Postgres at ${admin.host} (start it with ` +
        `\`pnpm db:run\`, or set INTEGRATION_DATABASE_URL): ${(error as Error).message}`,
    );
  }

  const testUrl = new URL(admin.toString());
  testUrl.pathname = `/${databaseName}`;

  const migrationSql = postgres(testUrl.toString(), { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(migrationSql), { migrationsFolder: MIGRATIONS_FOLDER });
  } catch (error) {
    await migrationSql.end();
    await adminSql.unsafe(`DROP DATABASE "${databaseName}" WITH (FORCE)`);
    await adminSql.end();
    throw error;
  }
  await migrationSql.end();

  provide('integrationDatabaseUrl', testUrl.toString());

  return async () => {
    await adminSql.unsafe(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`);
    await adminSql.end();
  };
}
