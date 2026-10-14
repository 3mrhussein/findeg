// Client-safe entry point for the catalog feature's Zod schemas/types.
//
// Unlike '../catalog/index' (the feature's main barrel), this module has no import
// path to '../catalog-factory/index' or 'db/src/connection.ts', so it
// is safe to import from Client Components. It only re-exports DTO
// schemas/types used for form validation — never services or the service
// factory. See docs/adr/0001-backend-feature-barrels.md.

export type { BrandInput } from '../catalog-brand-input/index';
export { BrandInputSchema } from '../catalog-brand-input/index';
export type { TagInput } from '../catalog-tag-input/index';
export { TagInputSchema } from '../catalog-tag-input/index';
export type { CollectionInput } from '../catalog-collection-input/index';
export { CollectionInputSchema } from '../catalog-collection-input/index';
export type { CategoryInput } from '../catalog-category-input/index';
