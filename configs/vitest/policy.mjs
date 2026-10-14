import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configDefaults } from 'vitest/config';
import { placementReporter } from './placement.mjs';
import { libraryScopes } from '../library-scopes.mjs';

// #445 activates measured workspaces here; all consumers use this one policy.
export const activeWorkspaces = ['packages/domain-errors'];
export const testInclude = [
  '**/*.{test,spec}.?(c|m)[jt]s?(x)',
  '**/__tests__/**/*.?(c|m)[jt]s?(x)',
];
// Non-test helpers under __tests__ (no test suite) are not executable tests.
export const helperExclude = ['**/__tests__/**/{fixture,fixtures,helper,helpers}.*'];
export const coverageInclude = ['**/*.{ts,tsx,js,jsx,mts,cts}'];
// A pilot scope measures only its library subtrees (configs/library-scopes.mjs).
export function coverageIncludeFor(scope) {
  return scope
    ? scope.map((directory) => `${directory}/**/*.{ts,tsx,js,jsx,mts,cts}`)
    : coverageInclude;
}
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

export function sharedTest({ root = process.cwd(), enabled, library, scope } = {}) {
  const workspace = path
    .relative(fileURLToPath(new URL('../../', import.meta.url)), root)
    .replaceAll(path.sep, '/');
  scope ??= libraryScopes[workspace];
  enabled ??= activeWorkspaces.includes(workspace) || scope !== undefined;
  library ??= workspace.startsWith('packages/');
  const measure = process.env.FINDEG_VITEST_MEASURE === '1';
  return {
    include: testInclude,
    exclude: [...configDefaults.exclude, ...helperExclude],
    globalSetup: [fileURLToPath(new URL('./setup.mjs', import.meta.url))],
    reporters: ['default', placementReporter({ enabled, library, measure, scope })],
    provide: { findegPolicy: { enabled, library, measure, scope } },
    coverage: {
      enabled: enabled || measure,
      provider: 'v8',
      include: coverageIncludeFor(scope),
      exclude: coverageExclude,
      reporter: ['text', 'json-summary'],
      thresholds: enabled ? thresholds : undefined,
      reportOnFailure: true,
    },
  };
}
