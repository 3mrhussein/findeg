import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 15000,
    env: {
      DATABASE_URL: 'postgres://localhost/findeg_test',
      DB_USER: 'postgres',
      DB_PASSWORD: 'password',
      DB_NAME: 'findeg_test',
    },
  },
});
