export {
    checkTagSlugAvailableRaw,
    getTagProductCountRaw,
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    bulkDeleteTags,
    bulkUpdateTagStatus,
    listDistinctTagGroups,
} from './admin-tags';
export {
    getCollectionsAll,
    getCollectionByIdWithTags,
    getCollectionBySlug,
    createCollection,
    updateCollection,
    deleteCollection,
    setCollectionTags,
    updateCollectionSortOrders,
} from './admin-collections';

// Product operations (general queries used by StoreFront and Admin)
export {
    getAll as getAllProducts,
    getById as getProductById,
    getByIds as getProductsByIds,
    getVariantsByIds,
    getFiltered as getFilteredProducts,
    countProducts,
} from './products';
export type { ProductRow, ProductFiltersInput } from './products';

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

// Admin categories
export {
    getCategoryById,
    getAllCategories,
    getCategoryBySlug,
    getCategoryRoots,
    getCategoryChildren,
    getCategoryDescendants,
    getCategoryByPath,
    countCategories,
    getCategoryProductCount,
    createCategory,
    updateCategory,
    reorderCategories,
    deleteCategory,
} from './admin-categories';
export type { DbCategory } from './admin-categories';

// Inventory operations
export {
    getBalance,
    getAllBalances,
    adjustStock,
    reserveStock,
    releaseReservation,
    getLowStock,
} from './inventory';
export type {
    InventoryBalanceRow,
    StockMovementRow,
    WarehouseRow,
    InventoryBalanceResult,
    StockMovementInput,
} from './inventory';

// Brands operations
export {
    getAll as getAllBrands,
    getById as getBrandById,
    getBySlug as getBrandBySlug,
    create as createBrand,
    update as updateBrand,
    deleteById as deleteBrand,
    count as countBrands,
    countProductsByBrandId,
} from './brands';
export type {
    BrandRow,
    BrandWithProductCount,
    BrandCreateInput,
    BrandUpdateInput,
} from './brands';
