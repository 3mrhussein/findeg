/**
 * Catalog Data Layer (Storefront)
 *
 * Provides cached data for the storefront catalog features.
 * Adheres to Next.js 16 "use cache" standards.
 */
'use cache';

import { cacheTag, cacheLife } from 'next/cache';
import { createCatalogServices } from '@findeg/backend/features/catalog';
import { parse } from '@findeg/backend/features/core';
import type {
  ShopPlpViewModel,
  SearchPageViewModel,
  CollectionPageViewModel,
  ProductPdpViewModel,
  HomePageData,
  ShopPageData,
  Product,
  Variant,
  Category,
  Brand,
  Collection,
  Review,
  ProductDetailPageData,
  CollectionsPageData,
  ShopPlpSort,
  FilterOption,
  CategoryFilterOption,
} from './types';
import { mapBrandOptions, mapCategoryOptions, mapProduct } from '../helpers/mappers';

/**
 * Shop PLP Data
 */
export async function getShopPlpViewModel(
  locale: string,
  slug: string[],
  query: any,
): Promise<ShopPlpViewModel | null> {
  const resolvedLocale = parse(locale);
  cacheTag('products', 'categories', `plp-${resolvedLocale}-${slug.join('-')}`);
  cacheLife('hours');

  const {
    products: productService,
    categories: categoryService,
    brands: brandService,
  } = createCatalogServices();

  let category = null;
  let currentCategoryName = '';

  if (slug.length > 0) {
    const categorySlug = slug[slug.length - 1];
    category = await categoryService.getBySlug(categorySlug, resolvedLocale);
    if (!category) return null;
    currentCategoryName = category.name;
  }

  const result = await productService.getFilteredProducts(
    {
      limit: 20,
      offset: 0,
      isActive: true,
      categoryId: category?.id,
    },
    resolvedLocale,
  );

  const mappedProducts = result.products.map((p) => mapProduct(p, resolvedLocale));

  return {
    products: mappedProducts,
    category,
    currentCategoryName,
    categoryOptions: mapCategoryOptions(
      await categoryService.getTree(resolvedLocale),
      {}, // TODO: Pass real counts if available
      resolvedLocale,
    ),
    brandOptions: mapBrandOptions(
      await brandService.getAll(true, resolvedLocale),
      {}, // Empty counts for now
    ),
    minPriceBound: 0,
    maxPriceBound: 1000,
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
    totalPages: Math.ceil(result.total / 20),
    page: 1,
    perPage: 20,
    from: 1,
    to: Math.min(result.total, 20),
    locale: resolvedLocale,
    query: query.q || '',
    categorySlugPath: slug,
    filters: {
      minPrice: Number(query.minPrice) || 0,
      maxPrice: Number(query.maxPrice) || 1000,
      brandIds: query.brandIds ? String(query.brandIds).split(',').map(Number).filter(Boolean) : [],
      inStockOnly: query.inStock === 'true',
      discounts: [],
    },
    sort: (query.sort as ShopPlpSort) || 'newest',
  };
}

/**
 * Search Page Data
 */
export async function getSearchPageViewModel(
  locale: string,
  rawQuery: string,
  query: any,
): Promise<SearchPageViewModel> {
  const resolvedLocale = parse(locale);
  cacheTag('products', 'categories', `search-${resolvedLocale}-${rawQuery}`);
  cacheLife('hours');

  const {
    search: searchService,
    categories: categoryService,
    brands: brandService,
  } = createCatalogServices();
  const result = await searchService.search({
    query: rawQuery,
    locale: resolvedLocale,
    limit: 20,
  });

  const mappedItems = result.items.map((p) => mapProduct(p, resolvedLocale));

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
    minPriceBound: 0,
    maxPriceBound: 1000,
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
    totalPages: Math.ceil(result.total / 20),
    page: 1,
    perPage: 20,
    from: 1,
    to: mappedItems.length,
    exactCount: true,
    locale: resolvedLocale,
    categorySlugPath: [],
    filters: {
      minPrice: 0,
      maxPrice: 1000,
      brandIds: [],
      inStockOnly: false,
      discounts: [],
    },
    sort: 'newest',
  };
}

/**
 * Metadata query for PDP
 */
export async function getProductBySlugOrIdForMetadata(locale: string, slug: string) {
  const resolvedLocale = parse(locale);
  const { products } = createCatalogServices();

  // Try by ID first if numeric, then by slug
  if (/^\d+$/.test(slug)) {
    return await products.getById(Number(slug), resolvedLocale);
  }
  return await products.getBySlug(slug, resolvedLocale);
}

/**
 * Top product slugs for static params
 */
export async function getTopProductSlugsForStaticParams(limit: number = 100) {
  const { products } = createCatalogServices();
  const allProducts = await products.getAll('en');

  return allProducts.slice(0, limit).map((p: any) => p.slug || String(p.id));
}

/** Full PDP View Model query — session-sensitive caching. */
export async function getProductPdp(
  locale: string,
  slug: string,
  session: any | null = null,
): Promise<ProductPdpViewModel | null> {
  const resolvedLocale = parse(locale);
  const {
    products: productService,
    brands: brandService,
    categories: categoryService,
  } = createCatalogServices();

  const product = await productService.getBySlug(slug, resolvedLocale);
  if (!product) return null;

  const brand = product.brandId
    ? await brandService.getById(product.brandId, resolvedLocale)
    : null;
  const categories = product.categoryId
    ? ([await categoryService.getById(product.categoryId, resolvedLocale)].filter(Boolean) as any[])
    : [];
  const related = await productService.getRelatedProducts(product, 4, resolvedLocale);

  const mappedProduct = mapProduct(product, resolvedLocale);
  const mappedRelated = related.map((p) => mapProduct(p, resolvedLocale));

  return {
    product: mappedProduct,
    selectedVariant: (mappedProduct.variants?.find((v: any) => v.isDefault) || mappedProduct.variants?.[0]) as Variant || null,
    canonicalSlug: slug,
    brand,
    categories,
    relatedProducts: mappedRelated,
    reviewSummary: {
      averageRating: product.rating || 0,
      totalReviews: product.reviewsCount || 0,
      verifiedReviews: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    initialReviews: [],
    reviewTotal: product.reviewsCount || 0,
    shouldRedirect: false,
    canonicalPath: `/shop/products/${slug}`,
    stockSnapshot: {
      inStock: mappedProduct.variants?.some((v) => (v.inventory?.[0]?.onHand || 0) > 0) || false,
      quantity:
        mappedProduct.variants?.reduce((acc, v) => acc + (v.inventory?.[0]?.onHand || 0), 0) || 0,
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

  const { products: productService } = createCatalogServices();
  const product = await productService.getById(productId, locale);
  if (!product) return null;

  const related = await productService.getRelatedProducts(product, 4, locale);

  const mappedRelated = related.map((p) => mapProduct(p, locale));

  return {
    product: mapProduct(product, locale),
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
  const { products } = createCatalogServices();
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

  const {
    products: productService,
    categories: categoryService,
    collections: collectionService,
  } = createCatalogServices();

  const products = await productService.getAll(locale);
  const categories = await categoryService.getAll(locale);
  const collections = await collectionService.getAllCollections();

  const mappedProducts = products.map((p) => mapProduct(p, locale));

  return {
    featuredProducts: mappedProducts.slice(0, 8),
    heroProducts: mappedProducts.slice(0, 3),
    categories: categories.filter((c) => c.parentId === null) as Category[],
    collections: collections as any, // Cast for now
  };
}

/**
 * Shop listing page data
 */
export async function getShopPageData(language: string): Promise<ShopPageData> {
  const locale = parse(language);
  cacheTag('products', `shop-${locale}`);
  cacheLife('hours');

  const { products: productService, categories: categoryService } = createCatalogServices();
  const products = await productService.getAll(locale);
  const categories = await categoryService.getAll(locale);

  const mappedProducts = products.map((p) => mapProduct(p, locale));

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

  const { collections: collectionService, categories: categoryService } = createCatalogServices();
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
  query: any,
): Promise<CollectionPageViewModel | null> {
  const resolvedLocale = parse(locale);
  cacheTag('products', 'collections', `collection-${resolvedLocale}-${slug}`);
  cacheLife('hours');

  const {
    collections: collectionService,
    products: productService,
    categories: categoryService,
    brands: brandService,
  } = createCatalogServices();
  const collection = await collectionService.getCollectionBySlug(slug);
  if (!collection) return null;

  const products = await productService.getByCategory(collection.id, resolvedLocale);

  const mappedProducts = products.map((p) => mapProduct(p, resolvedLocale));

  return {
    collection: collection as any,
    products: mappedProducts,
    categoryOptions: mapCategoryOptions(
      await categoryService.getTree(resolvedLocale),
      {},
      resolvedLocale,
    ),
    brandOptions: mapBrandOptions(await brandService.getAll(true, resolvedLocale), {}),
    minPriceBound: 0,
    maxPriceBound: 1000,
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
    from: 1,
    to: mappedProducts.length,
    locale: resolvedLocale,
    categorySlugPath: [],
    filters: {
      minPrice: 0,
      maxPrice: 1000,
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

  const { categories } = createCatalogServices();
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
 * Get real-time pricing for a specific product variant
 */
export async function getProductPricing(payload: {
  productId: number;
  variantId: number;
}) {
  cacheTag('products');
  cacheLife('minutes');

  const { products } = createCatalogServices();
  const product = await products.getById(payload.productId);

  if (!product) return { success: false, error: 'Product not found' };

  const variant = product.variants?.find((v: any) => v.id === payload.variantId);
  if (!variant) return { success: false, error: 'Variant not found' };

  return {
    success: true,
    data: {
      unitPrice: variant.basePrice,
      currency: 'EGP',
    },
  };
}
