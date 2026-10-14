import { node } from '@findeg/config/eslint/node';
export default [
  ...node,
  {
    files: ['src/features/catalog-variant-service/index.ts'],
    // Preserve the published empty constructor without asserting a function is a class.
    rules: { '@typescript-eslint/no-extraneous-class': ['error', { allowEmpty: true }] },
  },
];
