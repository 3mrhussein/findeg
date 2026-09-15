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
      // Legacy findings across the codebase (~1600 as of issue #101) are
      // downgraded to 'warn' rather than 'off' so they stay visible without
      // failing CI. Clearing them is tracked as separate follow-up work;
      // once clear, these should go back to 'error'.
      'no-undef': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'warn',
      'no-useless-escape': 'warn',
      'no-redeclare': 'warn',
      'no-fallthrough': 'warn',

      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-syntax': 'warn',
      'jsdoc/no-undefined-types': 'warn',
    },
  },
];
