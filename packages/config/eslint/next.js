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
    // `files` here isn't scoped to "just this rule": once any config object
    // matches a .ts/.tsx file, every rule from `base`/`shared` above that
    // has no `files` restriction of its own (no-undef, no-unused-vars, etc.)
    // starts applying to that file too. None of them are actually
    // configured correctly for this codebase yet (missing browser/React
    // globals, duplicate unused-vars rule, ~1600 pre-existing findings as
    // of 2026-09 — tracked in issue #101), so they're explicitly turned
    // off here to keep this rule's rollout isolated. Remove these
    // overrides once that underlying config gap is fixed.
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': 'off',
      'no-useless-escape': 'off',
      'no-redeclare': 'off',
      'no-fallthrough': 'off',

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
];
