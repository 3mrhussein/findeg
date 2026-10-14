import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configDefaults } from 'vitest/config';
import { placementReporter } from './placement.mjs';

// #445 activates the remaining measured workspaces here; all consumers use this one policy.
export const activeWorkspaces = ['packages/domain-errors', 'configs/env'];
export const testInclude = [
  '**/*.{test,spec}.?(c|m)[jt]s?(x)',
  '**/__tests__/**/*.?(c|m)[jt]s?(x)',
];
// Non-test helpers under __tests__ (no test suite) are not executable tests.
export const helperExclude = ['**/__tests__/**/{fixture,fixtures,helper,helpers}.*'];
export const coverageInclude = ['**/*.{ts,tsx,js,jsx,mts,cts}'];
export const coverageExclude = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/coverage/**',
  '**/cypress/**',
  '**/*.d.ts',
  '**/constants.ts',
  '**/types.ts',
  '**/__tests__/**',
  '**/*.{test,spec}.*',
  '**/test/**',
  '**/testing/**',
  '**/*.config.*',
  '**/generated/**',
];
export const thresholds = { perFile: true, lines: 80, statements: 80, functions: 80, branches: 80 };

export function sharedTest({ root = process.cwd(), enabled, library } = {}) {
  const workspace = path
    .relative(fileURLToPath(new URL('../../', import.meta.url)), root)
    .replaceAll(path.sep, '/');
  enabled ??= activeWorkspaces.includes(workspace);
  library ??= workspace.startsWith('packages/');
  const measure = process.env.FINDEG_VITEST_MEASURE === '1';
  return {
    include: testInclude,
    exclude: [...configDefaults.exclude, ...helperExclude],
    globalSetup: [fileURLToPath(new URL('./setup.mjs', import.meta.url))],
    reporters: ['default', placementReporter({ enabled, library, measure })],
    provide: { findegPolicy: { enabled, library, measure } },
    coverage: {
      enabled: enabled || measure,
      provider: 'v8',
      include: coverageInclude,
      exclude: coverageExclude,
      reporter: ['text', 'json-summary'],
      thresholds: enabled ? thresholds : undefined,
      reportOnFailure: true,
    },
  };
}
