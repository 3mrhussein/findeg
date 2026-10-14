// Whole-library source scopes shared by ESLint layout, Vitest placement and coverage.
// Paths are relative to each workspace root; bounded contexts live under src/features/.
export const libraryScopes = {
  'packages/domain': ['src'],
  'packages/identity': ['src'],
  'packages/orders': ['src'],
  'packages/school-lists': ['src'],
  'packages/catalog': ['src'],
  'packages/partners': ['src'],
};
