// The standard: how strictly each rule is enforced right now.
//
// Layers (see ../README.md):
//   L0 hygiene     syntax, formatting, type-safety basics        layers/hygiene.js
//   L1 runtime     what a package may assume about its runtime   layers/runtime.js
//   L2 boundaries  which workspace packages it may depend on     layers/boundaries.js
//   L3 surface     which entries of another package it may use   layers/surface.js
//   L4 integrity   no suppressing the checks above               layers/integrity.js
//
// A rule listed here is "under ratchet": it is reported as a warning while known
// violations remain. Every rule NOT listed here is an error. Promote a rule by deleting
// its line once `packages/config/ratchet.json` holds no entry for it (see README).
// Agents must never edit this file or ratchet.json in a feature change.
export const ratchet = {
  'local/declared-workspace-dependencies': 'warn',
  'local/no-suppression-comments': 'warn',
};

/**
 * @param {string} ruleId
 * @returns {'warn' | 'error'}
 */
export const severity = (ruleId) => ratchet[ruleId] ?? 'error';
