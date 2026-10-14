import path from 'node:path';
import { libraryLayoutRule } from './rules/library-layout.js';

/**
 * Recursive library layout for the given source subtrees of one package. The scopes are
 * relative to the package root, which is where the flat configuration file lives. Applications
 * and the UI library never call this, so they keep their own structural conventions.
 * @param {string[]} scopes
 * @param {{root?: string}} options
 */
export function libraryLayout(scopes, { root = process.cwd() } = {}) {
  const src = path.join(root, 'src');
  return [
    {
      files: scopes.map((scope) => `${scope}/**/*.{ts,tsx}`),
      plugins: { 'findeg-library': { rules: { layout: libraryLayoutRule } } },
      rules: { 'findeg-library/layout': ['error', { src }] },
    },
  ];
}
