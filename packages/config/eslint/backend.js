import globals from 'globals';
import { base } from './base.js';
import { shared } from './shared.js';

export const backend = [
  ...base,
  ...shared,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@findeg/dashboard/**', '@findeg/storefront/**', '@findeg/ui/**', 'next/**'],
        },
      ],
    },
  },
];
