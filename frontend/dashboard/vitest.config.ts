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
      '@lib': path.resolve(__dirname, './src/lib'),
      '@actions': path.resolve(__dirname, './src/actions'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@findeg/backend': path.resolve(__dirname, '../../backend/src'),
    },
  },
});
