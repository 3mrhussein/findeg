// Ecosystem baseline: imports maintained standard best-practice presets.
import js from '@eslint/js';
import { fixupConfigRules } from '@eslint/compat';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CODE, TYPESCRIPT } from './globs.js';
import { naming } from './naming.js';
import { unusedArgumentCompatibility } from './unused-argument-compatibility.js';

export const completeScopes = [
  'configs',
  'configs/env',
  'packages/catalog',
  'packages/domain',
  'packages/domain-errors',
  'packages/identity',
  'packages/inventory',
  'packages/orders',
  'packages/partners',
  'packages/school-lists',
];

export function isCompleteScope(root = process.cwd()) {
  const repository = fileURLToPath(new URL('../../', import.meta.url));
  const rel = path.relative(repository, root).split(path.sep).join('/');
  return completeScopes.includes(rel);
}

/**
 * @param {'isomorphic' | 'node' | 'browser' | 'next'} role
 * @param {{root?: string, complete?: boolean}} [options]
 */
export async function standards(role, { root = process.cwd(), complete = true } = {}) {
  if (!['isomorphic', 'node', 'browser', 'next'].includes(role)) {
    throw new Error(`Unknown standards role: ${role}`);
  }
  const ecosystem = [];
  if (complete && role === 'browser') {
    const [{ default: react }, { default: hooks }, { default: a11y }] = await Promise.all([
      import('eslint-plugin-react'),
      import('eslint-plugin-react-hooks'),
      import('eslint-plugin-jsx-a11y'),
    ]);
    ecosystem.push(
      // React 7 still uses context APIs removed in ESLint 10.
      ...fixupConfigRules([react.configs.flat.recommended, react.configs.flat['jsx-runtime']]),
      hooks.configs.flat.recommended,
      a11y.flatConfigs.recommended,
    );
  }
  if (complete && role === 'next') {
    const { default: next } = await import('eslint-config-next/core-web-vitals');
    ecosystem.push(...next);
    // Next's accessibility rules are a subset; extend the maintained full baseline
    // with the SAME plugin instance (Next registers the namespace object).
    const a11y = next.find((config) => config.plugins?.['jsx-a11y']).plugins['jsx-a11y'];
    ecosystem.push({ ...a11y.flatConfigs.recommended, plugins: { 'jsx-a11y': a11y } });
  }
  if (complete && (role === 'node' || role === 'next')) {
    const { default: node } = await import('eslint-plugin-n');
    ecosystem.push({
      ...node.configs['flat/recommended-module'],
      files:
        role === 'node' ? CODE : ['*.{js,mjs,cjs,ts}', 'src/data/**/*.ts', 'src/app/**/route.ts'],
    });
  }
  return [
    {
      ignores: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/.turbo/**',
        '**/next-env.d.ts',
      ],
    },
    { ...js.configs.recommended, files: CODE },
    ...(complete
      ? [
          {
            files: CODE,
            plugins: { findeg: { rules: { naming } } },
            rules: { 'findeg/naming': 'error' },
          },
        ]
      : []),
    ...ecosystem.map((config) =>
      config.ignores && !config.rules ? config : { ...config, files: config.files ?? CODE },
    ),
    ...(complete ? tseslint.configs.strictTypeChecked : tseslint.configs.recommended).map(
      (config) => ({ ...config, files: TYPESCRIPT }),
    ),
    {
      files: TYPESCRIPT,
      languageOptions: {
        parserOptions: complete ? { projectService: true, tsconfigRootDir: root } : {},
      },
    },
    {
      files: CODE,
      languageOptions: {
        globals: {
          ...globals.es2022,
          ...(role === 'node' || role === 'next' ? globals.node : {}),
          ...(role === 'browser' || role === 'next' ? globals.browser : {}),
        },
      },
    },
    ...(role === 'browser' || role === 'next'
      ? [
          {
            files: CODE,
            settings: { react: { version: 'detect' } },
          },
          {
            files: ['**/*.tsx'],
            // tsc checks TypeScript props; keep runtime prop validation on JavaScript JSX.
            rules: { 'react/prop-types': 'off' },
          },
        ]
      : []),
    ...(complete && (role === 'node' || role === 'next')
      ? [
          {
            files:
              role === 'node'
                ? TYPESCRIPT
                : ['*.{ts,mts,cts}', 'src/data/**/*.ts', 'src/app/**/route.ts'],
            // tsc resolves TS paths/extensions and validates emitted syntax; Node's
            // source resolver and syntax-version checks cannot model TS compilation.
            rules: {
              'n/no-missing-import': 'off',
              'n/no-missing-require': 'off',
              'n/no-unsupported-features/es-syntax': 'off',
              'n/no-unsupported-features/node-builtins': [
                'error',
                {
                  ignores: ['process.loadEnvFile'],
                },
              ],
            },
          },
        ]
      : []),
    {
      files: TYPESCRIPT,
      // Keep positional arguments before the last used argument; reject dummy trailing/rest arguments.
      rules: { '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used' }] },
    },
    {
      files: ['cypress/**/*.ts'],
      // Ambient namespace merging is how Cypress extends its global command interface.
      rules: { '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }] },
    },
    ...(complete && role === 'node'
      ? [
          {
            files: ['bin/*.mjs'],
            // CLI exit statuses are the public contract of these executable entry points.
            rules: { 'n/no-process-exit': 'off' },
          },
        ]
      : []),
    ...(
      unusedArgumentCompatibility[
        path
          .relative(fileURLToPath(new URL('../../', import.meta.url)), root)
          .split(path.sep)
          .join('/')
      ] ?? []
    ).map(({ files, names }) => ({
      files,
      name: `findeg/legacy-unused-argument/${names.join('-')}`,
      // Reasons live alongside the exact legacy file/name pairs in the compatibility registry.
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { args: 'after-used', argsIgnorePattern: `^(${names.join('|')})$` },
        ],
      },
    })),
    prettier,
  ];
}
