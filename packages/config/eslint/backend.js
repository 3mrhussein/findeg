import globals from 'globals';
import { base } from './base.js';
import { shared } from './shared.js';
import { ordersBoundaryRule } from './rules/orders-boundary.js';

export const backend = [
  ...base,
  ...shared,

  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
    plugins: { local: { rules: { 'orders-boundary': ordersBoundaryRule } } },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'local/orders-boundary': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@findeg/dashboard/**', '@findeg/storefront/**', '@findeg/ui/**', 'next/**'],
        },
      ],
    },
  },
];
