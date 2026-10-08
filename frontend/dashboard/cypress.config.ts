import path from 'node:path';
import { defineConfig } from 'cypress';

const artifactsBase = process.env.TEST_ARTIFACTS_DIR
  ? path.join(process.env.TEST_ARTIFACTS_DIR, 'dashboard')
  : 'cypress/coverage';

export default defineConfig({
  reporter: 'spec',
  allowCypressEnv: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3001',
    defaultCommandTimeout: 10000,
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    // Temporary quarantine: restore each spec through its tracked follow-up.
    excludeSpecPattern: [
      'cypress/e2e/orders/order-operations-phase-4.cy.ts', // #344
    ],
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    screenshotsFolder: path.join(artifactsBase, 'screenshots'),
    videosFolder: path.join(artifactsBase, 'videos'),
    downloadsFolder: path.join(artifactsBase, 'downloads'),
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    LOCALE: 'en',
    ADMIN_EMAIL: 'admin@findeg.com',
    ADMIN_PASSWORD: 'password123',
  },
});
