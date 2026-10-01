import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['src/**/*.integration.test.ts'],
    exclude: ['**/node_modules/**'],
    globalSetup: ['./src/test/integration/globalSetup.ts'],
    // Tests share one migrated database per run, so files run one at a time.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
