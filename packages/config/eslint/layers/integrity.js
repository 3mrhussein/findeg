// L4 integrity: the checks above cannot be switched off from inside the code they judge.
import { CODE } from '../globs.js';
import { local } from '../rules/index.js';
import { severity } from '../standard.js';

export const integrity = [
  {
    files: CODE,
    plugins: { local },
    rules: {
      'local/no-suppression-comments': [severity('local/no-suppression-comments')],
    },
  },
];
