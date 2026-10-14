import { node } from '@findeg/config/eslint/node';
export default [
  ...node,
  {
    files: ['src/helpers/domain-failures/index.ts'],
    // The legacy failure API takes an explicit output type while mapping every known
    // Domain code at runtime. Keep that contract without an unused dummy argument (#477).
    rules: { '@typescript-eslint/no-unnecessary-type-parameters': 'off' },
  },
];
