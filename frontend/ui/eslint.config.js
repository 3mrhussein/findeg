import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      jsdoc,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@findeg/dashboard', '@findeg/dashboard/**'],
              message: 'UI components should not import from dashboard.',
            },
            {
              group: ['@findeg/storefront', '@findeg/storefront/**'],
              message: 'UI components should not import from storefront.',
            },
            {
              group: ['@findeg/db/connection', '@findeg/db/migrate', '@findeg/db/scripts/**'],
              message: 'UI components should not import database logic or connections directly.',
            },
            {
              group: ['@findeg/backend', '@findeg/backend/**'],
              message: 'UI components should not import backend domain logic. Use shared primitives from @findeg/db.',
            },
          ],
        },
      ],
      // JSDoc rules
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-syntax': 'warn',
      'jsdoc/check-tag-names': 'warn',
      'jsdoc/no-undefined-types': 'warn',
      'jsdoc/check-types': 'warn',
      'jsdoc/check-values': 'warn',
      'jsdoc/no-multi-asterisks': 'warn',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'eslint.config.js'],
  },
);
