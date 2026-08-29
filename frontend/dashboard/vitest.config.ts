import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@actions': path.resolve(__dirname, './src/actions'),
      '@findeg/backend/features/core': path.resolve(
        __dirname,
        './src/test/mocks/backend-core.ts',
      ),
      '@findeg/backend/features/identity': path.resolve(
        __dirname,
        './src/test/mocks/backend-identity.ts',
      ),
      '@findeg/backend/features/administration': path.resolve(
        __dirname,
        './src/test/mocks/backend-administration.ts',
      ),
      '@i18n': path.resolve(__dirname, './src/i18n'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
});
