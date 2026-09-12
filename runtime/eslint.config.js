import { backend } from '@findeg/config/eslint/backend';
export default [
  ...backend,
  { files: ['src/**/*.ts'], rules: { 'no-undef': 'off', 'no-unused-vars': 'off' } },
];
