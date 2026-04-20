import type { Category } from "@findeg/backend/features/catalog/domain/entities/Category";
import { ProductEntity, type Product } from "@findeg/backend/features/catalog/domain/entities/Product";

export const LISTING_SORT_VALUES = ["featured", "price-asc", "price-desc", "rating-desc"] as const;

export type ListingSort = (typeof LISTING_SORT_VALUES)[number];

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

/** Extended FilterOption for hierarchical category trees */
export interface CategoryFilterOption extends FilterOption {
  parentId?: string; // parent slug
  children?: CategoryFilterOption[];
}

export interface ListingFilters {
  selectedCategorySlugs: string[];
  selectedBrandSlugs: string[];
  selectedPriceRange: [number, number];
  selectedSort: ListingSort;
}

interface ListingFilterInput {
  products: Product[];
  categories: Category[];
  filters: ListingFilters;
}

interface PriceBounds {
  minPrice: number;
  maxPrice: number;
}

export function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function toUniqueArray(value: string | string[] | undefined): string[] {
  const seen = new Set<string>();
  const normalized = toArray(value)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const unique: string[] = [];

  for (const entry of normalized) {
    if (seen.has(entry)) continue;
    seen.add(entry);
    unique.push(entry);
  }

  return unique;
}

export function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parsePriceRange(
  value: string | string[] | undefined,
  fallback: [number, number],
): [number, number] {
  const arr = toArray(value);
  if (arr.length !== 2) return fallback;

  const min = Number(arr[0]);
  const max = Number(arr[1]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return fallback;

  return sanitizePriceRange([min, max], fallback);
}

export function sanitizePriceRange(
  range: [number, number],
  bounds: [number, number],
): [number, number] {
  const [boundMin, boundMax] = bounds[0] <= bounds[1] ? bounds : [bounds[1], bounds[0]];
  /**
   *
   */
  const clamp = (value: number) => Math.min(Math.max(value, boundMin), boundMax);
  const min = clamp(range[0]);
  const max = clamp(range[1]);

  if (min > max) return [boundMin, boundMax];
  return [min, max];
}

export function normalizeListingSort(value: string | undefined): ListingSort {
  if (LISTING_SORT_VALUES.includes(value as ListingSort)) {
    return value as ListingSort;
  }
  return "featured";
}

export function getPriceBounds(products: Product[]): PriceBounds {
  if (products.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 1000,
    };
  }

  const allMinPrices = products.map((product) => {
    const variants = product.variants || [];
    if (variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.basePrice));
  });

  return {
    minPrice: Math.floor(Math.min(...allMinPrices)),
    maxPrice: Math.ceil(Math.max(...allMinPrices)),
  };
}

export function buildCategoryOptions(categories: Category[], products: Product[]): FilterOption[] {
  const categoryPathsById = new Map(
    categories.map((category) => [category.id, category.path || ""]),
  );

  return categories
    .filter((category) => category.isActive !== false)
    .map((category) => {
      const categoryPath = category.path || "";
      const count = products.filter((product) => {
        if (typeof product.categoryId !== "number") return false;

        const productCategoryPath = categoryPathsById.get(product.categoryId);
        if (typeof productCategoryPath !== "string") return false;
        if (!categoryPath) return product.categoryId === category.id;
        return productCategoryPath.startsWith(categoryPath);
      }).length;

      return {
        id: category.slug,
        label: category.name,
        count,
      };
    });
}

export function buildCategoryTree(
  categories: Category[],
  products: Product[],
): CategoryFilterOption[] {
  const categoryPathsById = new Map(categories.map((c) => [c.id, c.path || ""]));
  const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));

  const activeCategories = categories.filter((c) => c.isActive !== false);

  const buildCount = (category: Category): number => {
    const categoryPath = category.path || "";
    return products.filter((product) => {
      if (typeof product.categoryId !== "number") return false;
      const productCategoryPath = categoryPathsById.get(product.categoryId);
      if (typeof productCategoryPath !== "string") return false;
      if (!categoryPath) return product.categoryId === category.id;
      return productCategoryPath.startsWith(categoryPath);
    }).length;
  };

  const toOption = (category: Category): CategoryFilterOption => ({
    id: category.slug,
    label: category.name,
    count: buildCount(category),
    parentId: category.parentId ? categorySlugById.get(category.parentId) : undefined,
  });

  // Separate root nodes (depth 0 or no parentId)
  const roots = activeCategories.filter((c) => !c.parentId || c.depth === 0);
  const children = activeCategories.filter((c) => c.parentId && c.depth !== 0);

  // Attach children to their parents
  return roots.map((root) => {
    const rootOption = toOption(root);
    const directChildren = children.filter((c) => c.parentId === root.id).map(toOption);
    if (directChildren.length > 0) {
      rootOption.children = directChildren;
    }
    return rootOption;
  });
}

export function buildBrandOptions(products: Product[]): FilterOption[] {
  const grouped = new Map<string, { label: string; count: number }>();

  for (const product of products) {
    if (!product.brandName) continue;
    const normalizedLabel = product.brandName.trim();
    const id = toSlug(normalizedLabel);
    if (!id) continue;

    const existing = grouped.get(id);
    if (existing) {
      existing.count += 1;
      continue;
    }

    grouped.set(id, {
      label: normalizedLabel,
      count: 1,
    });
  }

  return Array.from(grouped.entries())
    .map(([id, value]) => ({
      id,
      label: value.label,
      count: value.count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function parseListingFilters(
  query: { [key: string]: string | string[] | undefined },
  fallbackPriceRange: [number, number],
): ListingFilters {
  return {
    selectedCategorySlugs: toUniqueArray(query.categories).map((value) => value.toLowerCase()),
    selectedBrandSlugs: toUniqueArray(query.brands).map((value) => value.toLowerCase()),
    selectedPriceRange: parsePriceRange(query.price, fallbackPriceRange),
    selectedSort: normalizeListingSort(typeof query.sort === "string" ? query.sort : undefined),
  };
}

export function sortProducts(products: Product[], sort: ListingSort): Product[] {
  const sorted = [...products];

  const getMinPrice = (p: Product) => {
    const variants = p.variants || [];
    if (variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.basePrice));
  };

  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => getMinPrice(a) - getMinPrice(b));
      return sorted;
    case "price-desc":
      sorted.sort((a, b) => getMinPrice(b) - getMinPrice(a));
      return sorted;
    case "rating-desc":
      sorted.sort((a, b) => b.rating - a.rating);
      return sorted;
    default:
      sorted.sort(
        (a, b) => Number(new ProductEntity(b).isNew()) - Number(new ProductEntity(a).isNew()),
      );
      return sorted;
  }
}

export function applyListingFilters({
  products,
  categories,
  filters,
}: ListingFilterInput): Product[] {
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const categoryPathsById = new Map(
    categories.map((category) => [category.id, category.path || ""]),
  );
  const selectedCategoryIds = filters.selectedCategorySlugs
    .map((slug) => categoriesBySlug.get(slug)?.id)
    .filter((value): value is number => typeof value === "number");
  const selectedCategoryPaths = filters.selectedCategorySlugs
    .map((slug) => categoriesBySlug.get(slug)?.path)
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  const filtered = products.filter((product) => {
    let categoryMatch = filters.selectedCategorySlugs.length === 0;
    if (!categoryMatch && typeof product.categoryId === "number") {
      const productCategoryPath = categoryPathsById.get(product.categoryId);
      categoryMatch =
        selectedCategoryIds.includes(product.categoryId) ||
        (typeof productCategoryPath === "string" &&
          selectedCategoryPaths.some((path) => productCategoryPath.startsWith(path)));
    }

    const brandMatch =
      filters.selectedBrandSlugs.length === 0 ||
      (product.brandName !== undefined &&
        filters.selectedBrandSlugs.includes(toSlug(product.brandName)));

    const priceMatch = (product.variants || []).some(
      (v) =>
        v.basePrice >= filters.selectedPriceRange[0] &&
        v.basePrice <= filters.selectedPriceRange[1],
    );

    return categoryMatch && brandMatch && priceMatch;
  });

  return sortProducts(filtered, filters.selectedSort);
}
