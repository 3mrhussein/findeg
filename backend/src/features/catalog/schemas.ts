// Client-safe entry point for the catalog feature's Zod schemas/types.
//
// Unlike './index.ts' (the feature's main barrel), this module has no import
// path to './application/services/factory' or 'db/src/connection.ts', so it
// is safe to import from Client Components. It only re-exports DTO
// schemas/types used for form validation — never services or the service
// factory. See docs/adr/0001-backend-feature-barrels.md.

export type { BrandInput } from './application/dtos/BrandInput';
export { BrandInputSchema } from './application/dtos/BrandInput';
export type { TagInput } from './application/dtos/TagInput';
export { TagInputSchema } from './application/dtos/TagInput';
export type { CollectionInput } from './application/dtos/CollectionInput';
export { CollectionInputSchema } from './application/dtos/CollectionInput';
export type { CategoryInput } from './application/dtos/CategoryInput';
