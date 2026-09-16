import globals from 'globals';
import { base } from './base.js';
import { shared } from './shared.js';
import { createNoFullBarrelImportInClientComponentsRule } from './rules/no-full-barrel-import-in-client-components.js';

// Feature names whose backend barrel (backend/src/features/<name>/index.ts)
// is the only sanctioned import path. Add a feature here as its PR in the
// barrel migration (docs/architecture/BACKEND_BARREL_MIGRATION_PLAN.md)
// lands. See docs/adr/0001-backend-feature-barrels.md.
const BARRELED_BACKEND_FEATURES = [
  'administration',
  'cart',
  'catalog',
  'core',
  'identity',
  'media',
  'notifications',
  'order',
  'review',
  'school',
];

// Feature names that also publish a client-safe `<feature>/schemas` entry
// point (isomorphic DTOs/Zod schemas only, no path to the service factory or
// db/connection.ts), mapped to the schema value export names that entry
// point re-exports. Deep imports into `<feature>/schemas` are exempted from
// the blanket internals block below, and Client Components are required to
// import these specific values from there instead of the full barrel (plain
// type imports from the full barrel remain fine — they're erased at compile
// time). See docs/adr/0001-backend-feature-barrels.md.
const SCHEMA_EXPORT_NAMES_BY_FEATURE = {
  catalog: ['BrandInputSchema', 'TagInputSchema', 'CollectionInputSchema'],
  core: ['TranslationMapSchema'],
  order: ['ShippingAddressSchema', 'VariantSnapshotSchema', 'OrderStatusUpdateSchema'],
};
const FEATURES_WITH_CLIENT_SAFE_SCHEMAS = Object.keys(SCHEMA_EXPORT_NAMES_BY_FEATURE);

export const next = [
  ...base,
  ...shared,

  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
    plugins: {
      local: {
        rules: {
          'no-full-barrel-import-in-client-components':
            createNoFullBarrelImportInClientComponentsRule(SCHEMA_EXPORT_NAMES_BY_FEATURE),
        },
      },
    },
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
              group: FEATURES_WITH_CLIENT_SAFE_SCHEMAS.includes(feature)
                ? [
                    `@findeg/backend/features/${feature}/**`,
                    `!@findeg/backend/features/${feature}/schemas`,
                  ]
                : [`@findeg/backend/features/${feature}/**`],
              message: `Import from '@findeg/backend/features/${feature}' (the feature barrel) instead of reaching into its internals.`,
            })),
          ],
        },
      ],
      'local/no-full-barrel-import-in-client-components': 'error',
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
