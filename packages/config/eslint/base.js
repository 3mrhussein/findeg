import js from '@eslint/js';

export const base = [
  js.configs.recommended,

  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', '**/dist/**', '**/.turbo/**'],
  },

  {
    // js.configs.recommended's core `no-unused-vars` would otherwise double
    // up with shared.js's `@typescript-eslint/no-unused-vars`; that rule is
    // the sole enforcer everywhere.
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
