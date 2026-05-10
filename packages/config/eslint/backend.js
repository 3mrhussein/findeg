import { base } from './base.js';
import { shared } from './shared.js';

export const backend = [
  ...base,
  ...shared,

  {
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
