import globals from 'globals';
import { base } from './base.js';
import { shared } from './shared.js';

// Feature names whose backend barrel (backend/src/features/<name>/index.ts)
// is the only sanctioned import path. Add a feature here as its PR in the
// barrel migration (docs/architecture/BACKEND_BARREL_MIGRATION_PLAN.md)
// lands. See docs/adr/0001-backend-feature-barrels.md.
const BARRELED_BACKEND_FEATURES = ['administration','cart','catalog','core','identity','media','notifications','order','review','school'];

export const next = [
  ...base,
  ...shared,

  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@findeg/db/**'] },
            ...BARRELED_BACKEND_FEATURES.map((feature) => ({
              group: [`@findeg/backend/features/${feature}/**`],
              message: `Import from '@findeg/backend/features/${feature}' (the feature barrel) instead of reaching into its internals.`,
            })),
          ],
        },
      ],
    },
  },

  {
    // Cypress isn't one of the `globals` package's presets; `cy`/`Cypress`
    // come from the runner itself, `expect` from its bundled chai, and
    // describe/it/before(Each) from its bundled mocha.
    files: ['cypress/**/*.{js,ts}', 'cypress.config.ts'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.chai,
        cy: 'readonly',
        Cypress: 'readonly',
      },
    },
  },
];
