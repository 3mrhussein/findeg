import type { ProductFilters } from '@findeg/backend/features/catalog';
import type { ShopPlpSort } from './types';

type SearchParams = Record<string, string | string[] | undefined>;

type ListingSort = NonNullable<ProductFilters['sort']>;

export const SHOP_PLP_PAGE_SIZES = [24, 48, 96] as const;

const SORTS: Record<ShopPlpSort, ListingSort> = {
  newest: 'newest',
  popular: 'popular',
  rating: 'rating',
  'price-low-high': 'price_asc',
  'price-high-low': 'price_desc',
};

export interface ShopPlpQuery {
  sort: ShopPlpSort;
  backendSort: ListingSort;
  page: number;
  perPage: number;
  brandIds: number[];
  minPrice?: number;
  maxPrice?: number;
}

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const toArray = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

function positiveInt(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function priceBound(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * Reads the PLP URL state written by `ShopPlpClient` (`brandId` repeated,
 * `minPrice`/`maxPrice`, `sort`, `page`, `perPage`). Unknown or invalid values
 * fall back to the defaults instead of failing the page.
 */
export function parseShopPlpQuery(query: SearchParams): ShopPlpQuery {
  const rawSort = firstValue(query.sort);
  const sort: ShopPlpSort =
    rawSort && Object.hasOwn(SORTS, rawSort) ? (rawSort as ShopPlpSort) : 'newest';
  const perPage = positiveInt(firstValue(query.perPage));

  return {
    sort,
    backendSort: SORTS[sort],
    page: positiveInt(firstValue(query.page)) ?? 1,
    perPage: SHOP_PLP_PAGE_SIZES.find((size) => size === perPage) ?? SHOP_PLP_PAGE_SIZES[0],
    brandIds: toArray(query.brandId)
      .map((id) => positiveInt(id))
      .filter((id): id is number => id !== undefined),
    minPrice: priceBound(firstValue(query.minPrice)),
    maxPrice: priceBound(firstValue(query.maxPrice)),
  };
}
