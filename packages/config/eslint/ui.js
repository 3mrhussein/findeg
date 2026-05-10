import { base } from './base.js';
import { shared } from './shared.js';

export const ui = [
  ...base,
  ...shared,

  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@findeg/dashboard', '@findeg/dashboard/**'],
              message: 'UI components should not import from dashboard app.'
            },
            {
              group: ['@findeg/storefront', '@findeg/storefront/**'],
              message: 'UI components should not import from storefront app.'
            },
            {
              group: ['@findeg/backend', '@findeg/backend/**'],
              message: 'UI components should not import backend domain logic.'
            }
          ]
        },
      ],
    },
  },
];
