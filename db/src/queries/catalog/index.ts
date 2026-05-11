export { checkTagSlugAvailableRaw, getTagProductCountRaw } from './admin-tags';
export {
	executeCatalogScoredSearchRaw,
	getCatalogSuggestionsRaw,
	logCatalogSearchRaw,
} from './search';
export type {
	CatalogSearchQueryRawParams,
	CatalogSearchScoreRowRaw,
	CatalogSearchSuggestionCategoryRaw,
	CatalogSearchSuggestionProductRaw,
} from './search';

// Primitive count queries
export { getProductCountRaw, getCategoryCountRaw, getBrandCountRaw } from './counts';

// Health and quality checks
export { getCatalogHealthRaw } from './health';
export type { CatalogHealthRaw } from './health';

// Distribution analytics
export { getCategoryDistributionRaw } from './distribution';
export type { CategoryDistributionRaw } from './distribution';

// Top products analytics
export { getTopProductsRaw } from './top-products';
export type { TopProductRaw } from './top-products';
