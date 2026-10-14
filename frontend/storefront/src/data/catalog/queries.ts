'use cache';

import 'server-only';
import { DEFAULT_CURRENCY } from '@findeg/domain';
/**
 * Catalog Data Layer (Storefront)
 *
 * Provides cached data for the storefront catalog features.
 * Adheres to Next.js 16 "use cache" standards.
 */

import { cacheTag, cacheLife } from 'next/cache';
import {
  createProductService,
  createCategoryService,
  createBrandService,
  createSearchService,
  createCollectionService,
} from '@findeg/catalog';
import { parse } from '@findeg/catalog';
import type {
  ShopPlpViewModel,
  SearchPageViewModel,
  CollectionPageViewModel,
  ProductPdpViewModel,
  HomePageData,
  ShopPageData,
  Variant,
  Category,
  ProductDetailPageData,
  CollectionsPageData,
} from './types';
import { mapBrandOptions, mapCategoryOptions } from '../helpers/mappers';
import { mapProductsWithInventory } from './inventory';
import { parseShopPlpQuery } from './plp-query';

/**
 * Shop PLP Data
 */
export async function getShopPlpViewModel(
  locale: string,
  slug: string[],
  query: Record<string, string | string[] | undefined>,
): Promise<ShopPlpViewModel | null> {
  const resolvedLocale = parse(locale);
  cacheTag('products', 'categories', `plp-${resolvedLocale}-${slug.join('-')}`);
  cacheLife('hours');

  const productService = createProductService();
  const categoryService = createCategoryService();
  const brandService = createBrandService();

  let category = null;
  let currentCategoryName = '';

  if (slug.length > 0) {
    const categorySlug = slug[slug.length - 1];
    category = await categoryService.getBySlug(categorySlug, resolvedLocale);
    if (!category) return null;
    currentCategoryName = category.name;
  }

  const listing = parseShopPlpQuery(query);
  const offset = (listing.page - 1) * listing.perPage;
  const result = await productService.getFilteredProducts(
    {
      limit: listing.perPage,
      offset,
      isActive: true,
      categoryId: category?.id,
      brandIds: listing.brandIds,
      minPrice: listing.minPrice,
      maxPrice: listing.maxPrice,
      sort: listing.backendSort,
    },
    resolvedLocale,
  );

  const mappedProducts = await mapProductsWithInventory(result.products, resolvedLocale);
  const priceBounds = await productService.getPriceBounds(category?.id);
  const minPriceBound = priceBounds.minPrice;
  const maxPriceBound = priceBounds.maxPrice;

  return {
    products: mappedProducts,
    category,
    currentCategoryName,
    categoryOptions: mapCategoryOptions(
      await categoryService.getTree(resolvedLocale),
      {},
      resolvedLocale,
    ),
    brandOptions: mapBrandOptions(await brandService.getAll(true, resolvedLocale), {}),
    minPriceBound,
    maxPriceBound,
    facetCounts: {
      categories: {},
      brands: {},
      ratings: {},
      discounts: {
        onSale: 0,
        bundleDeals: 0,
      },
    },
    total: result.total,
    totalPages: Math.ceil(result.total / listing.perPage),
    page: listing.page,
    perPage: listing.perPage,
    from: mappedProducts.length > 0 ? offset + 1 : 0,
    to: mappedProducts.length > 0 ? offset + mappedProducts.length : 0,
    locale: resolvedLocale,
    query: String(query.q || '') || '',
    categorySlugPath: slug,
    filters: {
      minPrice: listing.minPrice ?? minPriceBound,
      maxPrice: listing.maxPrice ?? maxPriceBound,
      brandIds: listing.brandIds,
      inStockOnly: query.inStock === 'true',
      discounts: [],
    },
    sort: listing.sort,
  };
}

/**
 * Search Page Data
 */
export async function getSearchPageViewModel(
  locale: string,
  rawQuery: string,
  query: Record<string, string | string[] | undefined>,
): Promise<SearchPageViewModel> {
  const resolvedLocale = parse(locale);
  cacheTag('products', 'categories', `search-${resolvedLocale}-${rawQuery}`);
  cacheLife('hours');

  const searchService = createSearchService();
  const categoryService = createCategoryService();
  const brandService = createBrandService();
  const productService = createProductService();

  const listing = parseShopPlpQuery(query);
  const offset = (listing.page - 1) * listing.perPage;
  const inStockOnly = query.inStock === 'true';
  const brandId = listing.brandIds.length > 0 ? listing.brandIds[0] : undefined;
  const searchSort =
    listing.backendSort === 'popular'
      ? 'relevance'
      : (listing.backendSort as import('@findeg/catalog').SearchParams['sort']);

  const result = await searchService.search({
    query: rawQuery,
    locale: resolvedLocale,
    brandId,
    minPrice: listing.minPrice,
    maxPrice: listing.maxPrice,
    inStockOnly,
    sort: searchSort,
    limit: listing.perPage,
    offset,
  });

  const mappedItems = await mapProductsWithInventory(result.items, resolvedLocale);
  const priceBounds = await productService.getPriceBounds();

  return {
    mode: mappedItems.length > 0 ? 'search' : 'fallback',
    query: rawQuery,
    products: mappedItems,
    categoryOptions: mapCategoryOptions(
      await categoryService.getTree(resolvedLocale),
      {},
      resolvedLocale,
    ),
    brandOptions: mapBrandOptions(await brandService.getAll(true, resolvedLocale), {}),
    minPriceBound: priceBounds.minPrice,
    maxPriceBound: priceBounds.maxPrice,
    facetCounts: {
      categories: {},
      brands: {},
      ratings: {},
      discounts: {
        onSale: 0,
        bundleDeals: 0,
      },
    },
    total: result.total,
    totalPages: Math.ceil(result.total / listing.perPage),
    page: listing.page,
    perPage: listing.perPage,
    from: mappedItems.length > 0 ? offset + 1 : 0,
    to: mappedItems.length > 0 ? offset + mappedItems.length : 0,
    exactCount: true,
    locale: resolvedLocale,
    categorySlugPath: [],
    filters: {
      minPrice: listing.minPrice ?? priceBounds.minPrice,
      maxPrice: listing.maxPrice ?? priceBounds.maxPrice,
      brandIds: listing.brandIds,
      inStockOnly,
      discounts: [],
    },
    sort: listing.sort,
  };
}

/**
 * Metadata query for PDP
 */
export async function getProductBySlugOrIdForMetadata(locale: string, slug: string) {
  const resolvedLocale = parse(locale);
  const products = createProductService();

  if (/^\d+$/.test(slug)) {
    return await products.getById(Number(slug), resolvedLocale);
  }
  return await products.getBySlug(slug, resolvedLocale);
}

/**
 * Top product slugs for static params
 */
export async function getTopProductSlugsForStaticParams(limit: number = 100) {
  const products = createProductService();
  const allProducts = await products.getAll('en');
  return allProducts.slice(0, limit).map((p) => p.slug || String(p.id));
}

/**
 * Full PDP View Model query — session-sensitive caching.
 */
export async function getProductPdp(
  locale: string,
  slug: string,
): Promise<ProductPdpViewModel | null> {
  const resolvedLocale = parse(locale);

  const productService = createProductService();
  const brandService = createBrandService();
  const categoryService = createCategoryService();

  const product = await productService.getBySlug(slug, resolvedLocale);
  if (!product) return null;

  const brand = product.brandId
    ? await brandService.getById(product.brandId, resolvedLocale)
    : null;
  const categories = product.categoryId
    ? [await categoryService.getById(product.categoryId, resolvedLocale)].filter(
        (category): category is Category => category !== null,
      )
    : [];
  const related = await productService.getRelatedProducts(product, 4, resolvedLocale);

  const [mappedProduct] = await mapProductsWithInventory([product], resolvedLocale);
  const mappedRelated = await mapProductsWithInventory(related, resolvedLocale);
  if (!mappedProduct) return null;

  const totalAvailable = (mappedProduct.variants || []).reduce((variantSum, v) => {
    const freeInVariant = (v.inventory || [])
      .filter((inv) => inv.warehouseActive !== false)
      .reduce((sum, inv) => sum + Math.max(0, (inv.onHand || 0) - (inv.reserved || 0)), 0);
    return variantSum + freeInVariant;
  }, 0);

  return {
    product: mappedProduct,
    selectedVariant:
      ((mappedProduct.variants?.find((v) => v.isDefault) ||
        mappedProduct.variants?.[0]) as Variant) || null,
    canonicalSlug: slug,
    brand,
    categories,
    relatedProducts: mappedRelated,
    reviewSummary: {
      averageRating: 0,
      totalReviews: 0,
      verifiedReviews: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    initialReviews: [],
    reviewTotal: 0,
    shouldRedirect: false,
    canonicalPath: `/shop/products/${slug}`,
    stockSnapshot: {
      inStock: totalAvailable > 0,
      quantity: totalAvailable,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '/shop' },
      ...(categories[0]
        ? [{ label: categories[0].name, href: `/shop?categoryId=${categories[0].id}` }]
        : []),
      { label: mappedProduct.name },
    ],
  };
}

/**
 * Product detail page data (Old structure)
 */
export async function getProductDetailPageData(
  productId: number,
  language: string,
): Promise<ProductDetailPageData | null> {
  const locale = parse(language);
  cacheTag('products', `product-${productId}`, `product-${productId}-${locale}`);
  cacheLife('hours');

  const productService = createProductService();
  const product = await productService.getById(productId, locale);
  if (!product) return null;

  const related = await productService.getRelatedProducts(product, 4, locale);
  const mappedRelated = await mapProductsWithInventory(related, locale);

  return {
    product: (await mapProductsWithInventory([product], locale))[0]!,
    relatedProducts: mappedRelated,
    reviewSummary: {
      averageRating: product.rating || 0,
      totalReviews: product.reviewsCount || 0,
      verifiedReviews: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    initialReviews: [],
    reviewTotal: product.reviewsCount || 0,
  };
}

/**
 * Product IDs for Static Params
 */
export async function getProductIdsForStaticParams(): Promise<number[]> {
  const products = createProductService();
  const all = await products.getAll('en');
  return all.map((p) => p.id);
}

/**
 * Home page data
 */
export async function getHomePageData(language: string): Promise<HomePageData> {
  const locale = parse(language);
  cacheTag('home-page', 'products', 'categories', `home-${locale}`);
  cacheLife('hours');

  const productService = createProductService();
  const categoryService = createCategoryService();
  const collectionService = createCollectionService();

  const products = await productService.getAll(locale);
  const categories = await categoryService.getAll(locale);
  const collections = await collectionService.getAllCollections();

  const mappedProducts = await mapProductsWithInventory(products, locale);

  return {
    featuredProducts: mappedProducts.slice(0, 8),
    heroProducts: mappedProducts.slice(0, 3),
    categories: categories.filter((c) => c.parentId === null) as Category[],
    collections: collections,
  };
}

/**
 * Shop listing page data
 */
export async function getShopPageData(language: string): Promise<ShopPageData> {
  const locale = parse(language);
  cacheTag('products', `shop-${locale}`);
  cacheLife('hours');

  const productService = createProductService();
  const categoryService = createCategoryService();
  const products = await productService.getAll(locale);
  const categories = await categoryService.getAll(locale);

  const mappedProducts = await mapProductsWithInventory(products, locale);

  return {
    products: mappedProducts,
    categories: categories as Category[],
    total: products.length,
  };
}

/**
 * Collections listing page data
 */
export async function getCollectionsPage(language: string): Promise<CollectionsPageData> {
  const locale = parse(language);
  cacheTag('collections', 'categories', `collections-${locale}`);
  cacheLife('days');

  const collectionService = createCollectionService();
  const categoryService = createCategoryService();
  const collections = await collectionService.getAllCollections();
  const categories = await categoryService.getAll(locale);

  return {
    collections,
    trendingCategories: categories.slice(0, 6) as Category[],
  };
}

/**
 * Collection Page Data
 */
export async function getCollectionPageViewModel(
  slug: string,
  locale: string,
  _query: Record<string, string | string[] | undefined>,
): Promise<CollectionPageViewModel | null> {
  const resolvedLocale = parse(locale);
  cacheTag('products', 'collections', `collection-${resolvedLocale}-${slug}`);
  cacheLife('hours');

  const collectionService = createCollectionService();
  const productService = createProductService();
  const categoryService = createCategoryService();
  const brandService = createBrandService();
  const collection = await collectionService.getCollectionBySlug(slug);
  if (!collection) return null;

  const tagIds =
    (collection as unknown as { tags?: { id: number }[] }).tags?.map((t) => t.id) || [];
  const products =
    tagIds.length > 0 ? await productService.getProductsByTagIds(tagIds, resolvedLocale) : [];
  const mappedProducts = await mapProductsWithInventory(products, resolvedLocale);
  const priceBounds = await productService.getPriceBounds();

  return {
    collection: collection,
    products: mappedProducts,
    categoryOptions: mapCategoryOptions(
      await categoryService.getTree(resolvedLocale),
      {},
      resolvedLocale,
    ),
    brandOptions: mapBrandOptions(await brandService.getAll(true, resolvedLocale), {}),
    minPriceBound: priceBounds.minPrice,
    maxPriceBound: priceBounds.maxPrice,
    facetCounts: {
      categories: {},
      brands: {},
      ratings: {},
      discounts: {
        onSale: 0,
        bundleDeals: 0,
      },
    },
    total: products.length,
    totalPages: 1,
    page: 1,
    perPage: mappedProducts.length,
    from: mappedProducts.length > 0 ? 1 : 0,
    to: mappedProducts.length,
    locale: resolvedLocale,
    categorySlugPath: [],
    filters: {
      minPrice: priceBounds.minPrice,
      maxPrice: priceBounds.maxPrice,
      brandIds: [],
      inStockOnly: false,
      discounts: [],
    },
    sort: 'newest',
  };
}

/**
 * Get hierarchical category tree for navigation
 */
export async function getCategoryTree(locale: string = 'en') {
  const resolvedLocale = parse(locale);
  cacheTag('categories');
  cacheLife('hours');

  const categories = createCategoryService();
  const tree = await categories.getTree(resolvedLocale);

  return tree.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    parentId: c.parentId || undefined,
    icon: c.icon,
    image: c.image,
  }));
}

/**
 * Get real-time pricing for a specific product variant (cached per minute).
 *
 * @param payload - Product and variant identifiers
 * @returns Pricing data or error response
 */
export async function getProductPricing(payload: { productId: number; variantId: number }) {
  cacheTag('products');
  cacheLife('minutes');

  const products = createProductService();
  const product = await products.getById(payload.productId);

  if (!product) return { success: false, error: 'Product not found' };

  const variant = product.variants?.find((v) => v.id === payload.variantId);
  if (!variant) return { success: false, error: 'Variant not found' };

  return {
    success: true,
    data: {
      unitPrice: variant.basePrice,
      currency: DEFAULT_CURRENCY,
    },
  };
}
