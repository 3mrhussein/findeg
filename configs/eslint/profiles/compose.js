import { standards, isCompleteScope } from '../standards.js';
import globals from 'globals';

/**
 * A profile applies ecosystem standards to one kind of package role.
 * @param {'isomorphic' | 'node' | 'browser' | 'next'} runtime
 * @param {{ extra?: object[] }} [options]
 */
export async function compose(runtime, { extra = [] } = {}) {
  return [...(await standards(runtime, { complete: isCompleteScope() })), ...extra];
}

// Cypress isn't one of the `globals` package's presets; `cy`/`Cypress` come from the runner
// itself, `expect` from its bundled chai, and describe/it/before(Each) from its bundled mocha.
export const cypressGlobals = {
  files: ['cypress/**/*.{js,ts}', 'cypress.config.ts'],
  languageOptions: {
    globals: { ...globals.mocha, ...globals.chai, cy: 'readonly', Cypress: 'readonly' },
  },
};
