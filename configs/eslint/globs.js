export const CODE = ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'];
export const TYPESCRIPT = ['**/*.{ts,tsx,mts,cts}'];
// Tests may use what the production runtime lacks (for example `node:fs` in an isomorphic package).
export const TESTS = ['**/__tests__/**', '**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'];
