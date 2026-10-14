import { nodeTest } from '../../configs/vitest/defaults';
import { defineConfig } from 'vitest/config';

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
    exclude: ['**/node_modules/**', '**/dist/**', 'src/**/*.integration.test.ts'],
  },
});
