import { Product, CategoryFilterOption, FilterOption } from '../catalog/types';

/**
 * Helpers for filter options
 */
export function mapCategoryOptions(
  categories: any[],
  categoryCounts: Record<string, number>,
  locale: string,
): CategoryFilterOption[] {
  return categories.map((c) => ({
    id: String(c.id),
    label: c.localizedName?.[locale] || c.name,
    slug: c.slug,
    count: categoryCounts[c.id] || 0,
    parentId: c.parentId ? String(c.parentId) : null,
    children: mapCategoryOptions(c.children || [], categoryCounts, locale),
  }));
}

export function mapBrandOptions(
  brands: any[],
  brandCounts: Record<string, number>,
): FilterOption[] {
  return brands.map((b) => ({
    id: String(b.id),
    label: b.name,
    count: brandCounts[b.id] || 0,
  }));
}

/**
 * Helper to map backend product to storefront product
 */
export function mapProduct(p: any, locale: string): Product {
  return {
    ...p,
    slug: p.slug || '',
    variants: (p.variants || []).map((v: any) => ({
      ...v,
      inventory: v.inventory || [],
    })),
    isNew: p.createdAt
      ? new Date(p.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      : false,
  };
}
