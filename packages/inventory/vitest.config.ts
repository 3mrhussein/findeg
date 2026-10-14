import { defineConfig } from 'vitest/config';
import { nodeTest } from '../../configs/vitest/defaults';

export default defineConfig({
  test: { ...nodeTest, exclude: [...(nodeTest.exclude ?? []), 'src/**/*.integration.test.ts'] },
});
