import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export const shared = [
  prettierConfig,
  {
    // Activates ESLint's TS/TSX processing for every consumer: without a
    // `files` glob naming these extensions, `eslint .` never lints them at
    // all (see issue #101). Consumers add their own `files`-scoped blocks
    // for env-specific globals (browser/Node) on top of this.
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jsdoc,
      prettier,
    },
    languageOptions: {
      parser: tseslint.parser,
      // Baseline globals true in every environment this repo runs in.
      // Consumers layer browser or Node specifics on top.
      globals: {
        ...globals.es2021,
      },
    },

    rules: {
      // Keep the warning cleanup from issue #125 enforced for every consumer.
      'no-undef': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'prettier/prettier': 'error',
      'no-useless-escape': 'error',
      'no-redeclare': 'error',
      'no-fallthrough': 'error',

      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-syntax': 'warn',
      'jsdoc/no-undefined-types': 'warn',
    },
  },
  {
    // TypeScript's compiler already catches undefined references, and
    // `no-undef` false-positives on ambient/global types (React, NodeJS,
    // JQuery) used only in type position (see issue #125). Matches
    // typescript-eslint's standard guidance to disable this rule for
    // TS/TSX files.
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      'no-undef': 'off',
    },
  },
];
