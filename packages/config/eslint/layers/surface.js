// L3 surface: a package may use another package only through the entries it publishes.
import { CODE } from '../globs.js';
import {
  BARRELED_BACKEND_FEATURES,
  SCHEMA_EXPORT_NAMES_BY_FEATURE,
  SERVER_ONLY_ENTRY_POINTS_BY_FEATURE,
} from '../registry.js';
import { local } from '../rules/index.js';
import { severity } from '../standard.js';

const FEATURES_WITH_CLIENT_SAFE_SCHEMAS = Object.keys(SCHEMA_EXPORT_NAMES_BY_FEATURE);

// Applies to every package: Orders publishes exactly three entries.
export const surface = [
  {
    files: CODE,
    plugins: { local },
    rules: { 'local/orders-boundary': severity('local/orders-boundary') },
  },
];

// Applies to Next.js apps, which consume Backend features and must stay out of the database.
export const clientSurface = [
  {
    files: CODE,
    plugins: { local },
    rules: {
      'no-restricted-imports': [
        severity('no-restricted-imports'),
        {
          patterns: [
            { group: ['@findeg/db', '@findeg/db/**'] },
            ...BARRELED_BACKEND_FEATURES.map((feature) => ({
              group: [
                `@findeg/backend/features/${feature}/**`,
                ...(FEATURES_WITH_CLIENT_SAFE_SCHEMAS.includes(feature)
                  ? [`!@findeg/backend/features/${feature}/schemas`]
                  : []),
                ...(SERVER_ONLY_ENTRY_POINTS_BY_FEATURE[feature] ?? []).map(
                  (entry) => `!@findeg/backend/features/${feature}/${entry}`,
                ),
              ],
              message: `Import from '@findeg/backend/features/${feature}' (the feature barrel) instead of reaching into its internals.`,
            })),
          ],
        },
      ],
      'local/no-full-barrel-import-in-client-components': severity(
        'local/no-full-barrel-import-in-client-components',
      ),
    },
  },
];
