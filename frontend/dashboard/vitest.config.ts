import { browserTest } from '../../configs/vitest/defaults';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    ...browserTest,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      'server-only': path.resolve(__dirname, './src/test/server-only.ts'),
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@data': path.resolve(__dirname, './src/data'),
      '@actions': path.resolve(__dirname, './src/actions'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
      '@findeg/backend': path.resolve(__dirname, '../../backend/src'),
      '@findeg/env': path.resolve(__dirname, '../../configs/env/src'),
    },
  },
});
