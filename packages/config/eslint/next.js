import { base } from './base.js';
import { shared } from './shared.js';

export const next = [
  ...base,
  ...shared,

  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@findeg/db/**'],
        },
      ],
    },
  },
];
