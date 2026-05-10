import js from '@eslint/js';

export const base = [
  js.configs.recommended,

  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', '**/dist/**', '**/.turbo/**'],
  },
];
