// Library pilot scopes: source subtrees that already follow the recursive library convention
// (configs/eslint/rules/library-layout.js) and are measured by shared Vitest per file. Each
// workspace lists its areas here; a migration ticket appends its areas, and #445 removes the
// per-area list once the whole workspace is enforced. Paths are relative to the workspace root.
export const libraryScopes = {
  'packages/domain': [
    'src/common',
    'src/customers',
    'src/catalog',
    'src/partners',
    'src/school-lists',
  ],
};
