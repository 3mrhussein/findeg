import { nodeTest } from '../configs/vitest/defaults';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    ...nodeTest,
    env: {
      DATABASE_URL: 'postgres://localhost/findeg_test',
      DB_USER: 'postgres',
      DB_PASSWORD: 'password',
      DB_NAME: 'findeg_test',
      JWT_SECRET: 'test-secret-key-12345678901234567890',
      JWT_REFRESH_SECRET: 'test-refresh-secret-key-12345678901234567890',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    },
    // Integration tests need Postgres; they run via vitest.integration.config.ts.
    exclude: [...(nodeTest.exclude ?? []), 'src/**/*.integration.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      '@features': resolve(import.meta.dirname, './src/features'),
      '@findeg/backend': resolve(import.meta.dirname, './src'),
      '@lib': resolve(import.meta.dirname, './src/lib'),
      '@findeg/env': resolve(import.meta.dirname, '../configs/env/src'),
    },
  },
});
