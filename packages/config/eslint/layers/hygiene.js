// L0 hygiene: syntax, formatting and type-safety basics. Identical for every package.
import js from '@eslint/js';
import json from '@eslint/json';
import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { CODE, TYPESCRIPT } from '../globs.js';
import { local } from '../rules/index.js';
import { severity } from '../standard.js';

export const hygiene = [
  // Scoped to code files so the JSON block below is not run through JS-only core rules.
  { ...js.configs.recommended, files: CODE },

  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/next-env.d.ts',
    ],
  },

  {
    // js.configs.recommended's core `no-unused-vars` would otherwise double
    // up with `@typescript-eslint/no-unused-vars` below; that rule is
    // the sole enforcer everywhere.
    rules: {
      'no-unused-vars': 'off',
    },
  },

  {
    // Every workspace package.json must define the common scripts (see the rule for the list).
    files: ['package.json'],
    language: 'json/json',
    plugins: { json, local },
    rules: { 'local/required-package-scripts': severity('local/required-package-scripts') },
  },

  prettierConfig,
  {
    // Activates ESLint's TS/TSX processing for every consumer: without a
    // `files` glob naming these extensions, `eslint .` never lints them at
    // all (see issue #101).
    files: CODE,
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jsdoc,
      prettier,
    },
    languageOptions: {
      parser: tseslint.parser,
      // Baseline globals true in every environment this repo runs in.
      // The runtime layer adds browser or Node specifics on top.
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
    files: TYPESCRIPT,
    rules: {
      'no-undef': 'off',
    },
  },
];
