import { defineConfig } from 'vitest/config';
import { nodeTest } from '../../configs/vitest/defaults';
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
  test: {
    ...nodeTest,
    env: unitEnv,
    exclude: [...(nodeTest.exclude ?? []), 'src/**/*.integration.test.ts'],
  },
});
