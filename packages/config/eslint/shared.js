import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export const shared = [
  prettierConfig,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jsdoc,
      prettier,
    },
    languageOptions: {
      parser: tseslint.parser,
    },

    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-syntax': 'warn',
      'jsdoc/no-undefined-types': 'warn',

      'prettier/prettier': 'error',
    },
  },
];
