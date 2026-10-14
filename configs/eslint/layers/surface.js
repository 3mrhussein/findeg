// Package exports and ADR-0019 define public surfaces; Next.js owns client boundaries.
import { CODE } from '../globs.js';
import { local } from '../rules/index.js';
import { severity } from '../standard.js';
export const surface = [
  {
    files: CODE,
    plugins: { local },
    rules: { 'local/orders-boundary': severity('local/orders-boundary') },
  },
];
