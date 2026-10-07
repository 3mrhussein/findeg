import js from '@eslint/js';
import json from '@eslint/json';
import { requiredPackageScriptsRule } from './rules/required-package-scripts.js';

export const base = [
  // Scoped to code files so the JSON block below is not run through JS-only core rules.
  { ...js.configs.recommended, files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'] },

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
    // up with shared.js's `@typescript-eslint/no-unused-vars`; that rule is
    // the sole enforcer everywhere.
    rules: {
      'no-unused-vars': 'off',
    },
  },

  {
    // Every workspace package.json must define the common scripts (see the rule for the list).
    files: ['package.json'],
    language: 'json/json',
    plugins: { json, local: { rules: { 'required-package-scripts': requiredPackageScriptsRule } } },
    rules: { 'local/required-package-scripts': 'error' },
  },
];
