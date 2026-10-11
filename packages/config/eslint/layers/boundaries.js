// L2 boundaries: a package may import only the workspace packages its manifest declares.
// The manifest is the contract; the rule derives everything from it, so adding a package
// needs no change here.
import { CODE } from '../globs.js';
import { local } from '../rules/index.js';
import { severity } from '../standard.js';

export const boundaries = [
  {
    files: CODE,
    plugins: { local },
    rules: {
      'local/declared-workspace-dependencies': [severity('local/declared-workspace-dependencies')],
    },
  },
];
