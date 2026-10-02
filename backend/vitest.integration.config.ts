import { defineConfig } from 'vitest/config';
import unitConfig from './vitest.config';

/**
 * Integration tests run against a real Postgres 16. The global setup creates a
 * fresh, fully migrated database for the run and drops it afterwards; tests
 * reach it through `connectToTestDatabase()` from `src/testing/postgres`.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    globalSetup: ['./src/testing/postgres/global-setup.ts'],
    setupFiles: ['./src/testing/postgres/setup.ts'],
    // Every file shares the run's database; running files one at a time keeps
    // one file's rows and locks from interfering with another's assertions.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
  resolve: unitConfig.resolve,
});
