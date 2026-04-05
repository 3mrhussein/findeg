/**
 * Cache tag constants and factories for `'use cache'` invalidation.
 *
 * - Flat tags (e.g. `CATALOG_PRODUCTS`) bust all entries in a collection.
 * - Tag factories (e.g. `productDetail`) bust a single entity precisely.
 */
export declare const CACHE_TAGS: {
    readonly CATALOG_PRODUCTS: "catalog:products";
    readonly CATALOG_CATEGORIES: "catalog:categories";
    readonly CATALOG_BRANDS: "catalog:brands";
    readonly CATALOG_TAGS: "catalog:tags";
    readonly CATALOG_COLLECTIONS: "catalog:collections";
    readonly CATALOG_REVIEWS: "catalog:reviews";
    /** Tag for a single product detail cache entry. */
    readonly productDetail: (id: number) => string;
    /** Tag for a single category detail cache entry. */
    readonly categoryDetail: (slug: string) => string;
    /** Tag for a single tag detail cache entry. */
    readonly tagDetail: (id: number) => string;
    /** Tag for a single collection detail cache entry. */
    readonly collectionDetail: (id: number) => string;
};
