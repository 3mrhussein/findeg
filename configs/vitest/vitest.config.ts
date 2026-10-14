import { defineConfig } from 'vitest/config';
import { nodeTest } from './defaults';
export default defineConfig({
  test: { ...nodeTest, exclude: [...(nodeTest.exclude ?? []), '**/*.integration.test.ts'] },
});
