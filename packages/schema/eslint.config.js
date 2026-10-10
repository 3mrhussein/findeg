import { backend } from '@findeg/config/eslint/backend';

export default [
  ...backend,

  {
    // The Business Domain Schema is the leaf of the workspace graph: it is imported by
    // db, packages, Backend and both frontends (client bundles included).
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@findeg/*', '@findeg/*/**'],
              message: '@findeg/schema must not depend on other workspace packages.',
            },
            {
              group: ['drizzle-orm', 'drizzle-orm/**', 'postgres'],
              message: 'Schema is persistence-agnostic; keep Drizzle in db.',
            },
            { group: ['next', 'next/**', 'react', 'react/**'] },
            { group: ['node:*'], message: '@findeg/schema must stay runtime-agnostic.' },
          ],
        },
      ],
    },
  },
];
