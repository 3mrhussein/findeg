import globals from 'globals';
import { hygiene } from '../layers/hygiene.js';
import { runtimeLayer } from '../layers/runtime.js';
import { boundaries } from '../layers/boundaries.js';
import { surface, clientSurface } from '../layers/surface.js';
import { integrity } from '../layers/integrity.js';

/**
 * A profile is the standard applied to one kind of package: every layer, with the runtime
 * chosen by the package's role. A new stack adds a runtime entry and a profile file; it never
 * copies rules.
 * @param {keyof typeof import('../layers/runtime.js').RUNTIMES} runtime
 * @param {{ client?: boolean, extra?: object[] }} [options]
 */
export function compose(runtime, { client = false, extra = [] } = {}) {
  return [
    ...hygiene,
    ...runtimeLayer(runtime),
    ...boundaries,
    ...surface,
    ...(client ? clientSurface : []),
    ...integrity,
    ...extra,
  ];
}

// Cypress isn't one of the `globals` package's presets; `cy`/`Cypress` come from the runner
// itself, `expect` from its bundled chai, and describe/it/before(Each) from its bundled mocha.
export const cypressGlobals = {
  files: ['cypress/**/*.{js,ts}', 'cypress.config.ts'],
  languageOptions: {
    globals: { ...globals.mocha, ...globals.chai, cy: 'readonly', Cypress: 'readonly' },
  },
};
