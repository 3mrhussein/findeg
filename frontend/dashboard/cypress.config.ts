import { defineConfig } from 'cypress';

export default defineConfig({
  reporter: 'spec',
  reporterOptions: {
    reportDir: 'cypress/coverage/reports',
  },
  allowCypressEnv: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3001',
    defaultCommandTimeout: 10000,
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    // Temporary quarantine: restore each spec through its tracked follow-up.
    excludeSpecPattern: [
      'cypress/e2e/admin/admin-dashboard-e2e.cy.ts', // #342
      'cypress/e2e/cache-invalidation.cy.ts', // #343
      'cypress/e2e/orders/order-operations-phase-4.cy.ts', // #344
      'cypress/e2e/architectural-boundaries.cy.ts', // #345
    ],
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    screenshotsFolder: 'cypress/coverage/screenshots',
    videosFolder: 'cypress/coverage/videos',
    downloadsFolder: 'cypress/coverage/downloads',
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
