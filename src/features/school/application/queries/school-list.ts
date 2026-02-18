import { getServices } from "@/server/getServices";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { resolveLocale } from "@/features/core/domain/value-objects";

export interface SchoolListViewModel {
  rawCode: string;
  normalizedCode: string;
  productIds: number[];
  products: Product[];
  totalEstimatedCost: number;
}

/**
 * Extracts a school list code from free-form input or URL.
 */
function extractCode(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    return (
      url.searchParams.get("code") ||
      url.searchParams.get("items") ||
      url.searchParams.get("products") ||
      ""
    ).trim();
  } catch {
    return trimmed;
  }
}

/**
 * Parses product IDs from a list code.
 * Supports comma/space/dash separated numeric IDs (e.g. "12,44,108").
 */
function parseProductIds(code: string): number[] {
  const parsed = code
    .split(/[^0-9]+/g)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  return Array.from(new Set(parsed));
}

/**
 * Resolves a school list bundle from a code/link.
 */
export async function getSchoolListViewModel(
  locale: string,
  rawCode: string,
): Promise<SchoolListViewModel> {
  const resolvedLocale = resolveLocale(locale);
  const normalizedCode = extractCode(rawCode);
  const productIds = parseProductIds(normalizedCode);

  if (!normalizedCode || productIds.length === 0) {
    return {
      rawCode,
      normalizedCode,
      productIds: [],
      products: [],
      totalEstimatedCost: 0,
    };
  }

  const { products } = getServices();
  const resolved = await Promise.all(
    productIds.map(async (id) => products.getById(id, resolvedLocale)),
  );

  const productMap = new Map(resolved.filter(Boolean).map((product) => [product!.id, product!]));
  const orderedProducts = productIds
    .map((id) => productMap.get(id))
    .filter((product): product is Product => Boolean(product));

  return {
    rawCode,
    normalizedCode,
    productIds,
    products: orderedProducts,
    totalEstimatedCost: orderedProducts.reduce((sum, product) => sum + product.price, 0),
  };
}
