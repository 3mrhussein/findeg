import { getServices } from "@/server/getServices";
import { resolveLocale, type Locale } from "@/features/core/domain/value-objects";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { Category } from "@/features/catalog/domain/entities/Category";
import { ProductEntity } from "@/features/catalog/domain/entities/Product";
import { VariantEntity, type Variant } from "@/features/catalog/domain/entities/Variant";
import type { SearchParams } from "@/features/catalog/application/interfaces/ISearchService";

const PER_PAGE_VALUES = [24, 48, 96] as const;
const SORT_VALUES = ["popular", "newest", "price-low-high", "price-high-low", "rating"] as const;
const DISCOUNT_VALUES = ["on-sale", "bundle-deals"] as const;
const MAX_FACET_PRODUCTS = 5000;

export type ShopPlpPerPage = (typeof PER_PAGE_VALUES)[number];
export type ShopPlpSort = (typeof SORT_VALUES)[number];
export type ShopPlpDiscount = (typeof DISCOUNT_VALUES)[number];
export type ShopPlpView = "grid" | "list";

export interface ShopPlpFilters {
  brandIds: number[];
  minPrice: number;
  maxPrice: number;
  ratingMin?: number;
  inStockOnly: boolean;
  discounts: ShopPlpDiscount[];
}

export interface ShopPlpFacetCounts {
  categories: Record<string, number>;
  brands: Record<string, number>;
  ratings: Record<number, number>;
  discounts: {
    onSale: number;
    bundleDeals: number;
  };
}

export interface ShopPlpViewModel {
  locale: Locale;
  query: string;
  categorySlugPath: string[];
  currentCategorySlug?: string;
  currentCategoryName?: string;
  filters: ShopPlpFilters;
  minPriceBound: number;
  maxPriceBound: number;
  sort: ShopPlpSort;
  view: ShopPlpView;
  page: number;
  perPage: ShopPlpPerPage;
  from: number;
  to: number;
  total: number;
  totalPages: number;
  products: Product[];
  facetCounts: ShopPlpFacetCounts;
}

interface ParsedShopQuery {
  query: string;
  brandIds: number[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  sort: ShopPlpSort;
  page: number;
  perPage: ShopPlpPerPage;
  ratingMin?: number;
  discounts: ShopPlpDiscount[];
  view: ShopPlpView;
}

interface CategoryResolution {
  isValidPath: boolean;
  matchedSlugs: string[];
  category?: Category;
}

/**
 * Returns the first variant used for listing display.
 */
function getPrimaryVariant(product: Product): Variant | undefined {
  const variants = product.variants || [];
  return variants.find((variant) => variant.variantKey === "default") || variants[0];
}

/**
 * Returns minimum variant price for sorting and bounds.
 */
function getProductMinPrice(product: Product): number {
  const variants = product.variants || [];
  if (variants.length === 0) return 0;
  return Math.min(...variants.map((variant) => variant.basePrice));
}

/**
 * Returns true when any variant intersects with range.
 */
function isWithinPriceRange(product: Product, minPrice: number, maxPrice: number): boolean {
  return (product.variants || []).some(
    (variant) => variant.basePrice >= minPrice && variant.basePrice <= maxPrice,
  );
}

/**
 * Determines if product has sale pricing.
 */
function isOnSale(product: Product): boolean {
  return new ProductEntity(product).hasDiscount();
}

/**
 * Returns true when at least one variant carries explicit inventory balances.
 */
function hasExplicitInventory(product: Product): boolean {
  return (product.variants || []).some((variant) => (variant.inventory?.length ?? 0) > 0);
}

/**
 * Listing-safe stock check:
 * if inventory is not hydrated/tracked, treat product as available.
 */
function isInStockForListing(product: Product): boolean {
  if (!hasExplicitInventory(product)) {
    return true;
  }
  return new ProductEntity(product).isInStock();
}

/**
 * Lightweight bundle-deal detector until promotion tags are fully modeled in listing payloads.
 */
function isBundleDeal(product: Product): boolean {
  if ((product.tags || []).some((tag) => /bundle/i.test(tag.key))) return true;
  return /bundle|set|kit/i.test(`${product.name} ${product.description || ""}`);
}

/**
 * Converts arbitrary query value to normalized string array.
 */
function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).flatMap((entry) =>
    entry
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean),
  );
}

/**
 * Parses a URL value as finite integer.
 */
function parseInteger(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Clamps numeric value to a range.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parses boolean query value where missing means default true.
 */
function parseInStockOnly(value: string | undefined): boolean {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return !(
    normalized === "0" ||
    normalized === "false" ||
    normalized === "off" ||
    normalized === "no"
  );
}

/**
 * Parses sort parameter with whitelist fallback.
 */
function parseSort(value: string | undefined): ShopPlpSort {
  if (value && SORT_VALUES.includes(value as ShopPlpSort)) {
    return value as ShopPlpSort;
  }
  return "popular";
}

/**
 * Parses per-page selector with whitelist fallback.
 */
function parsePerPage(value: string | undefined): ShopPlpPerPage {
  const parsed = parseInteger(value);
  if (parsed && PER_PAGE_VALUES.includes(parsed as ShopPlpPerPage)) {
    return parsed as ShopPlpPerPage;
  }
  return 24;
}

/**
 * Parses optional rating threshold [1..5].
 */
function parseRating(value: string | undefined): number | undefined {
  const parsed = parseInteger(value);
  if (!parsed) return undefined;
  return clamp(parsed, 1, 5);
}

/**
 * Parses URL query object used by PLP.
 */
function parseShopQuery(query: { [key: string]: string | string[] | undefined }): ParsedShopQuery {
  const brandIds = toArray(query.brandId)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  const minPrice = parseInteger(toArray(query.minPrice)[0]);
  const maxPrice = parseInteger(toArray(query.maxPrice)[0]);
  const page = Math.max(parseInteger(toArray(query.page)[0]) || 1, 1);

  const discounts = toArray(query.discount)
    .map((entry) => entry.toLowerCase())
    .filter((entry): entry is ShopPlpDiscount =>
      DISCOUNT_VALUES.includes(entry as ShopPlpDiscount),
    );

  const viewCandidate = toArray(query.view)[0];
  const view: ShopPlpView = viewCandidate === "list" ? "list" : "grid";

  return {
    query: toArray(query.q)[0] || "",
    brandIds: Array.from(new Set(brandIds)),
    minPrice,
    maxPrice,
    inStockOnly: parseInStockOnly(toArray(query.inStock)[0]),
    sort: parseSort(toArray(query.sort)[0]),
    page,
    perPage: parsePerPage(toArray(query.perPage)[0]),
    ratingMin: parseRating(toArray(query.ratingMin)[0]),
    discounts: Array.from(new Set(discounts)),
    view,
  };
}

/**
 * Builds category relation map keyed by parent id.
 */
function buildChildrenByParent(categories: Category[]): Map<number | null, Category[]> {
  const map = new Map<number | null, Category[]>();

  for (const category of categories) {
    if (category.isActive === false) continue;
    const parentKey = category.parentId ?? null;
    const siblings = map.get(parentKey);
    if (siblings) {
      siblings.push(category);
    } else {
      map.set(parentKey, [category]);
    }
  }

  for (const siblings of map.values()) {
    siblings.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  return map;
}

/**
 * Resolves a category slug chain (/shop/a/b/c) against localized category tree.
 */
function resolveCategoryFromSlugPath(
  categories: Category[],
  slugPath: string[],
): CategoryResolution {
  const normalizedPath = slugPath.map((slug) => slug.trim().toLowerCase()).filter(Boolean);
  if (normalizedPath.length === 0) {
    return {
      isValidPath: true,
      matchedSlugs: [],
    };
  }

  const childrenByParent = buildChildrenByParent(categories);
  const matchedSlugs: string[] = [];
  let parentId: number | null = null;
  let current: Category | undefined;

  for (const slug of normalizedPath) {
    const candidates: Category[] = childrenByParent.get(parentId) ?? [];
    const match: Category | undefined = candidates.find(
      (candidate: Category) => candidate.slug.toLowerCase() === slug,
    );
    if (!match) {
      return {
        isValidPath: false,
        matchedSlugs,
      };
    }

    current = match;
    matchedSlugs.push(match.slug);
    parentId = match.id;
  }

  return {
    isValidPath: true,
    matchedSlugs,
    category: current,
  };
}

/**
 * Returns listing price bounds for products.
 */
function getPriceBounds(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 1000];

  const min = Math.floor(Math.min(...products.map((product) => getProductMinPrice(product))));
  const max = Math.ceil(Math.max(...products.map((product) => getProductMinPrice(product))));
  if (min > max) return [0, 1000];
  return [min, max];
}

/**
 * Applies local filters not fully covered by SearchService.
 */
function applyPlpFilters(products: Product[], filters: ShopPlpFilters): Product[] {
  const filtered = products.filter((product) => {
    if (filters.brandIds.length > 0) {
      const brandId = typeof product.brandId === "number" ? product.brandId : undefined;
      if (!brandId || !filters.brandIds.includes(brandId)) {
        return false;
      }
    }

    if (!isWithinPriceRange(product, filters.minPrice, filters.maxPrice)) {
      return false;
    }

    if (filters.inStockOnly && !isInStockForListing(product)) {
      return false;
    }

    if (filters.ratingMin && product.rating < filters.ratingMin) {
      return false;
    }

    if (filters.discounts.length > 0) {
      const discountMatch = filters.discounts.some((discount) => {
        if (discount === "on-sale") return isOnSale(product);
        if (discount === "bundle-deals") return isBundleDeal(product);
        return false;
      });
      if (!discountMatch) {
        return false;
      }
    }

    return true;
  });

  // Fallback for environments where inventory balances are not yet seeded:
  // keep listing visible instead of collapsing to an empty page.
  if (filters.inStockOnly && filtered.length === 0 && products.length > 0) {
    return products.filter((product) => {
      if (filters.brandIds.length > 0) {
        const brandId = typeof product.brandId === "number" ? product.brandId : undefined;
        if (!brandId || !filters.brandIds.includes(brandId)) {
          return false;
        }
      }

      if (!isWithinPriceRange(product, filters.minPrice, filters.maxPrice)) {
        return false;
      }

      if (filters.ratingMin && product.rating < filters.ratingMin) {
        return false;
      }

      if (filters.discounts.length > 0) {
        const discountMatch = filters.discounts.some((discount) => {
          if (discount === "on-sale") return isOnSale(product);
          if (discount === "bundle-deals") return isBundleDeal(product);
          return false;
        });
        if (!discountMatch) {
          return false;
        }
      }

      return true;
    });
  }

  return filtered;
}

/**
 * Applies PLP sort strategy.
 */
function sortPlpProducts(products: Product[], sort: ShopPlpSort): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "newest":
      sorted.sort((a, b) => {
        const isNewDelta =
          Number(new ProductEntity(b).isNew()) - Number(new ProductEntity(a).isNew());
        if (isNewDelta !== 0) return isNewDelta;
        return b.id - a.id;
      });
      return sorted;
    case "price-low-high":
      sorted.sort((a, b) => getProductMinPrice(a) - getProductMinPrice(b));
      return sorted;
    case "price-high-low":
      sorted.sort((a, b) => getProductMinPrice(b) - getProductMinPrice(a));
      return sorted;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
      return sorted;
    case "popular":
    default:
      sorted.sort((a, b) => b.reviewsCount - a.reviewsCount || b.rating - a.rating);
      return sorted;
  }
}

/**
 * Builds category facet counts keyed by slug.
 */
function buildCategoryFacetCounts(
  products: Product[],
  categories: Category[],
): Record<string, number> {
  const categoryPathById = new Map(
    categories.map((category) => [category.id, category.path || ""]),
  );
  const productPaths = products
    .map((product) => {
      if (typeof product.categoryId !== "number") return null;
      const path = categoryPathById.get(product.categoryId);
      return typeof path === "string" ? path : null;
    })
    .filter((path): path is string => typeof path === "string");

  const counts: Record<string, number> = {};

  for (const category of categories) {
    const categoryPath = category.path || "";
    if (!categoryPath) {
      counts[category.slug] = 0;
      continue;
    }

    counts[category.slug] = productPaths.filter((path) => path.startsWith(categoryPath)).length;
  }

  return counts;
}

/**
 * Builds brand facet counts keyed by brand id string.
 */
function buildBrandFacetCounts(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) {
    if (typeof product.brandId !== "number") continue;
    const key = String(product.brandId);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

/**
 * Builds rating facet counts for "N stars & above" thresholds.
 */
function buildRatingFacetCounts(products: Product[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let threshold = 1; threshold <= 5; threshold += 1) {
    counts[threshold] = products.filter((product) => product.rating >= threshold).length;
  }
  return counts;
}

/**
 * Builds discount facet counts.
 */
function buildDiscountFacetCounts(products: Product[]): { onSale: number; bundleDeals: number } {
  return {
    onSale: products.filter((product) => isOnSale(product)).length,
    bundleDeals: products.filter((product) => isBundleDeal(product)).length,
  };
}

/**
 * Returns a clamped price filter inside bounds.
 */
function toPriceFilter(
  parsedMinPrice: number | undefined,
  parsedMaxPrice: number | undefined,
  bounds: [number, number],
): { minPrice: number; maxPrice: number } {
  const [boundMin, boundMax] = bounds;
  const minPrice = clamp(parsedMinPrice ?? boundMin, boundMin, boundMax);
  const maxPrice = clamp(parsedMaxPrice ?? boundMax, boundMin, boundMax);
  return minPrice <= maxPrice
    ? { minPrice, maxPrice }
    : {
        minPrice: maxPrice,
        maxPrice: minPrice,
      };
}

/**
 * Creates the shop PLP server view model.
 */
export async function getShopPlpViewModel(
  locale: string,
  slugPath: string[],
  query: { [key: string]: string | string[] | undefined },
): Promise<ShopPlpViewModel | null> {
  const resolvedLocale = resolveLocale(locale);
  const parsed = parseShopQuery(query);
  const { categories, search } = getServices();

  const allCategories = await categories.getAll(resolvedLocale);
  const categoryResolution = resolveCategoryFromSlugPath(allCategories, slugPath);
  if (!categoryResolution.isValidPath) {
    return null;
  }

  const baseSearchParams: SearchParams = {
    query: parsed.query,
    locale: resolvedLocale,
    categoryId: categoryResolution.category?.id,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    // Stock filtering is applied in this query layer to support
    // graceful fallbacks when inventory data is not fully seeded.
    inStockOnly: false,
    sort: parsed.query ? "relevance" : "newest",
    limit: 1,
    offset: 0,
  };

  const firstPass = await search.search(baseSearchParams);
  const fullLimit = Math.min(Math.max(firstPass.total, 1), MAX_FACET_PRODUCTS);
  const fullResult = await search.search({
    ...baseSearchParams,
    limit: fullLimit,
    offset: 0,
  });

  const baseProducts = fullResult.items;
  const [minPriceBound, maxPriceBound] = getPriceBounds(baseProducts);
  const priceFilter = toPriceFilter(parsed.minPrice, parsed.maxPrice, [
    minPriceBound,
    maxPriceBound,
  ]);

  const filters: ShopPlpFilters = {
    brandIds: parsed.brandIds,
    minPrice: priceFilter.minPrice,
    maxPrice: priceFilter.maxPrice,
    ratingMin: parsed.ratingMin,
    inStockOnly: parsed.inStockOnly,
    discounts: parsed.discounts,
  };

  const filteredProducts = applyPlpFilters(baseProducts, filters);
  const sortedProducts = sortPlpProducts(filteredProducts, parsed.sort);

  const total = sortedProducts.length;
  const totalPages = Math.max(Math.ceil(total / parsed.perPage), 1);
  const page = clamp(parsed.page, 1, totalPages);
  const offset = (page - 1) * parsed.perPage;
  const pagedProducts = sortedProducts.slice(offset, offset + parsed.perPage);

  const from = total === 0 ? 0 : offset + 1;
  const to = total === 0 ? 0 : Math.min(offset + pagedProducts.length, total);

  return {
    locale: resolvedLocale,
    query: parsed.query,
    categorySlugPath: categoryResolution.matchedSlugs,
    currentCategorySlug: categoryResolution.category?.slug,
    currentCategoryName: categoryResolution.category?.name,
    filters,
    minPriceBound,
    maxPriceBound,
    sort: parsed.sort,
    view: parsed.view,
    page,
    perPage: parsed.perPage,
    from,
    to,
    total,
    totalPages,
    products: pagedProducts,
    facetCounts: {
      categories: buildCategoryFacetCounts(baseProducts, allCategories),
      brands: buildBrandFacetCounts(baseProducts),
      ratings: buildRatingFacetCounts(baseProducts),
      discounts: buildDiscountFacetCounts(baseProducts),
    },
  };
}

/**
 * Returns inventory-driven stock metadata for display badges in cards.
 */
export function getStockSnapshot(product: Product): {
  inStock: boolean;
  lowStock: boolean;
  availableUnits: number;
} {
  if (!hasExplicitInventory(product)) {
    return {
      inStock: true,
      lowStock: false,
      availableUnits: 0,
    };
  }

  const primaryVariant = getPrimaryVariant(product);
  if (!primaryVariant) {
    return {
      inStock: false,
      lowStock: false,
      availableUnits: 0,
    };
  }

  const variantEntity = new VariantEntity(primaryVariant);
  const availableUnits = variantEntity.getAvailableStock();
  return {
    inStock: variantEntity.isInStock(),
    lowStock: variantEntity.isLowStock(),
    availableUnits,
  };
}
