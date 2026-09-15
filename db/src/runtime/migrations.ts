import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

/** Explicit persistence construction; importing this module never connects. */
export async function runMigrations(config: { url: string; ssl: boolean }) {
  const connection = postgres(config.url, {
    max: 1,
    ssl: config.ssl ? 'verify-full' : false,
    connect_timeout: 10,
    onnotice: () => {},
  });
  try {
    await migrate(drizzle(connection), {
      migrationsFolder: fileURLToPath(new URL('../../migrations/', import.meta.url)),
    });
  } finally {
    await connection.end({ timeout: 5 });
  }
}
