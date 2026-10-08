import { backend } from '@findeg/config/eslint/backend';

export default [
  ...backend,

  {
    // A connection-free leaf shared by Backend, Dashboard and Storefront (client bundles
    // included): no workspace, framework, environment or Node-only dependencies.
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@findeg/*', '@findeg/*/**'],
              message: '@findeg/money must not depend on other workspace packages.',
            },
            { group: ['next', 'next/**', 'react', 'react/**'] },
            { group: ['node:*'], message: '@findeg/money must stay runtime-agnostic.' },
          ],
        },
      ],
    },
  },
];
