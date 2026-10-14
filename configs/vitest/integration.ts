import { nodeTest } from './defaults';
import { fileURLToPath } from 'node:url';

/** Integration runs include unit suites so coverage measures the complete implementation. */
export const integrationTest = {
  ...nodeTest,
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    GUEST_ACCESS_SECRET: 'test-guest-access-secret-1234567890123456',
  },
  globalSetup: [
    ...(Array.isArray(nodeTest.globalSetup)
      ? nodeTest.globalSetup
      : nodeTest.globalSetup
        ? [nodeTest.globalSetup]
        : []),
    fileURLToPath(new URL('./postgres/global-setup.ts', import.meta.url)),
  ],
  setupFiles: [fileURLToPath(new URL('./postgres/setup.ts', import.meta.url))],
  fileParallelism: false,
  testTimeout: 30_000,
  hookTimeout: 60_000,
};
