import { defineConfig } from "cypress";

export default defineConfig({
  reporter: "spec",
  reporterOptions: {},
  allowCypressEnv: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: "http://localhost:3001",
    defaultCommandTimeout: 10000,
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    downloadsFolder: "cypress/downloads",
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    LOCALE: "en",
    ADMIN_EMAIL: "admin@findeg.com",
    ADMIN_PASSWORD: "admin",
  },
});
