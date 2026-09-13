import { next } from '@findeg/config/eslint/next';
export default [
  ...next,
  { files: ['src/**/*.{ts,tsx}'], rules: { 'no-undef': 'off', 'no-unused-vars': 'off' } },
];
