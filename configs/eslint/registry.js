// Project-specific data read by the standard's layers. Contains facts about this repo,
// never rule logic: a new project replaces this file and keeps the layers and profiles.

// Feature names whose backend barrel (backend/src/features/<name>/index.ts)
// is the only sanctioned import path. See docs/adr/0001-backend-feature-barrels.md.
export const BARRELED_BACKEND_FEATURES = [
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
// the blanket internals block, and Client Components are required to
// import these specific values from there instead of the full barrel (plain
// type imports from the full barrel remain fine — they're erased at compile
// time). See docs/adr/0001-backend-feature-barrels.md.
export const SCHEMA_EXPORT_NAMES_BY_FEATURE = {
  catalog: ['BrandInputSchema', 'TagInputSchema', 'CollectionInputSchema'],
  core: [
    'TranslationMapSchema',
    'PERMISSION_CODES',
    'hasPermission',
    'hasAnyPermission',
    'hasAllPermissions',
    'systemAdmin',
    'staffRole',
  ],
  order: ['ShippingAddressSchema', 'VariantSnapshotSchema', 'OrderStatusUpdateSchema'],
};

// Server-only entry points kept out of the barrel because they reach Node-only modules (e.g.
// `core/logger` -> node:fs) that must never enter a Client Component bundle.
export const SERVER_ONLY_ENTRY_POINTS_BY_FEATURE = { core: ['logger'] };
