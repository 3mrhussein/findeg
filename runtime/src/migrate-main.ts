import { runMigrations } from '@findeg/db/migrations';
import { readMigrationConfig } from './config.js';

try {
  const config = readMigrationConfig(process.env);
  await runMigrations({ url: config.DATABASE_URL, ssl: config.DB_SSL });
  console.log(
    JSON.stringify({ event: 'migrated', process: 'migration', revision: config.RELEASE_REVISION }),
  );
} catch (error) {
  const message =
    error instanceof Error && error.message.startsWith('Invalid configuration:')
      ? error.message
      : 'Migration failed';
  console.error(JSON.stringify({ event: 'migration-failed', process: 'migration', message }));
  process.exitCode = 1;
}
