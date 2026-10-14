// Complete global standards, activated by each migration owner independently of layout.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { naming } from './rules/naming.js';
import { CODE, TYPESCRIPT } from './globs.js';

/**
 * @param {'isomorphic' | 'node' | 'browser' | 'next'} role
 * @param {{root?: string}} options
 */
export async function standards(role, { root = process.cwd() } = {}) {
  if (!['isomorphic', 'node', 'browser', 'next'].includes(role)) {
    throw new Error(`Unknown standards role: ${role}`);
  }
  const ecosystem = [];
  if (role === 'browser') {
    const [{ default: react }, { default: hooks }, { default: a11y }] = await Promise.all([
      import('eslint-plugin-react'),
      import('eslint-plugin-react-hooks'),
      import('eslint-plugin-jsx-a11y'),
    ]);
    ecosystem.push(
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      hooks.configs.flat.recommended,
      a11y.flatConfigs.recommended,
    );
  }
  if (role === 'next') {
    const { default: next } = await import('eslint-config-next/core-web-vitals');
    ecosystem.push(...next);
    // Next's accessibility rules are a subset; extend the maintained full baseline
    // with the SAME plugin instance (Next registers the namespace object).
    const a11y = next.find((config) => config.plugins?.['jsx-a11y']).plugins['jsx-a11y'];
    ecosystem.push({ ...a11y.flatConfigs.recommended, plugins: { 'jsx-a11y': a11y } });
  }
  if (role === 'node' || role === 'next') {
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
    ...ecosystem.map((config) =>
      config.ignores && !config.rules ? config : { ...config, files: config.files ?? CODE },
    ),
    ...tseslint.configs.strictTypeChecked.map((config) => ({ ...config, files: TYPESCRIPT })),
    {
      files: TYPESCRIPT,
      languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: root } },
    },
    {
      files: CODE,
      plugins: { findeg: { rules: { naming } } },
      rules: { 'findeg/naming': 'error' },
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
    ...(role === 'node' || role === 'next'
      ? [
          {
            files: TYPESCRIPT,
            // tsc resolves TS paths/extensions and validates emitted syntax; Node's
            // source resolver and syntax-version checks cannot model TS compilation.
            rules: {
              'n/no-missing-import': 'off',
              'n/no-missing-require': 'off',
              'n/no-unsupported-features/es-syntax': 'off',
            },
          },
        ]
      : []),
    prettier,
  ];
}
