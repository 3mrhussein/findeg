import { defineConfig } from 'vitest/config';
import { integrationTest } from '../../configs/vitest/integration';
import unitConfig from './vitest.config';
export default defineConfig({
  test: integrationTest,
  resolve: unitConfig.resolve,
});
