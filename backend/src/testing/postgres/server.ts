import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

const repoRoot = resolve(import.meta.dirname, '../../../..');

export const migrationsFolder = resolve(repoRoot, 'db/migrations');

/** Prefix of every database the harness creates, so leftovers are easy to spot. */
export const testDatabasePrefix = 'findeg_it_';

/**
 * URL of the Postgres server (and a maintenance database on it) that the
 * harness may create and drop databases on.
 *
 * `INTEGRATION_DATABASE_URL` wins when set (CI sets it). Otherwise the
 * docker-compose `postgres` service is used, via the `DB_*` variables from the
 * repo-root `.env`.
 */
export function resolveServerUrl(): string {
  if (process.env.INTEGRATION_DATABASE_URL) return process.env.INTEGRATION_DATABASE_URL;

  try {
    loadEnvFile(resolve(repoRoot, '.env'));
  } catch {
    // No .env: fall through to whatever DB_* the shell provides.
  }

  const { DB_HOST = 'localhost', DB_PORT = '5432', DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_USER || !DB_NAME) {
    throw new Error(
      'Integration tests need Postgres: set INTEGRATION_DATABASE_URL, or DB_USER/DB_PASSWORD/DB_NAME ' +
        '(from the repo-root .env) and start it with `pnpm db:run`.',
    );
  }

  const auth = DB_PASSWORD
    ? `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}`
    : encodeURIComponent(DB_USER);
  return `postgres://${auth}@${DB_HOST}:${DB_PORT}/${encodeURIComponent(DB_NAME)}`;
}

export function withDatabase(serverUrl: string, database: string): string {
  const url = new URL(serverUrl);
  url.pathname = `/${database}`;
  return url.toString();
}
