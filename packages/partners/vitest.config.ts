import { defineConfig } from 'vitest/config';
import { nodeTest } from '../../configs/vitest/defaults';

// One config file: the shared Vitest policy's coverage check only exempts `vitest.config.*`.
// `test:integration` sets FINDEG_PARTNERS_INTEGRATION=1 to run the Postgres suites.
const integration = process.env.FINDEG_PARTNERS_INTEGRATION === '1';

const unitEnv = {
  DATABASE_URL: 'postgres://localhost/findeg_test',
  DB_USER: 'postgres',
  DB_PASSWORD: 'password',
  DB_NAME: 'findeg_test',
  JWT_SECRET: 'test-secret-key-12345678901234567890',
  JWT_REFRESH_SECRET: 'test-refresh-secret-key-12345678901234567890',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
};

export default defineConfig({
  test: integration
    ? {
        ...nodeTest,
        env: unitEnv,
        // Unit and Postgres suites together, so the integration run measures the same per-file coverage.
        include: ['src/**/*.test.ts'],
        // The Postgres harness is shared with backend; it creates one migrated database per run.
        globalSetup: [
          ...(nodeTest.globalSetup ?? []),
          '../../backend/src/testing/postgres/global-setup.ts',
        ],
        setupFiles: ['../../backend/src/testing/postgres/setup.ts'],
        fileParallelism: false,
        testTimeout: 30000,
        hookTimeout: 60000,
      }
    : {
        ...nodeTest,
        env: unitEnv,
        exclude: [...(nodeTest.exclude ?? []), 'src/**/*.integration.test.ts'],
      },
});
