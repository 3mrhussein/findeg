import { base } from './base.js';
import { shared } from './shared.js';

export const db = [
  ...base,
  ...shared,

  {
    rules: {
      'no-restricted-imports': [
        'warn', // IMPORTANT: migration phase
        {
          patterns: [
            {
              group: ['@findeg/backend/**'],
              message: 'MIGRATION: backend logic should gradually move into DB layer',
            },
            {
              group: ['@findeg/dashboard/**'],
            },
            {
              group: ['@findeg/storefront/**'],
            },
            {
              group: ['next/**'],
            },
          ],
        },
      ],
    },
  },
];
