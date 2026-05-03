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
    files: ['**/*.ts'],
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
              group: ['@findeg/backend', '@findeg/backend/**'],
              message: 'Database layer should not import from backend. This creates circular dependency.',
            },
            {
              group: ['@findeg/dashboard', '@findeg/dashboard/**'],
              message: 'Database layer should not import from dashboard app.',
            },
            {
              group: ['@findeg/storefront', '@findeg/storefront/**'],
              message: 'Database layer should not import from storefront app.',
            },
            {
              group: ['@findeg/ui', '@findeg/ui/**'],
              message: 'Database layer should not import from UI components.',
            },
            {
              group: ['next', 'next/**'],
              message: 'Database layer should not import from Next.js. Must remain framework-agnostic.',
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
    ignores: ['**/dist/**', '**/node_modules/**', '**/migrations/**', 'eslint.config.js'],
  },
);
