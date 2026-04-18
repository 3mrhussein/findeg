import { resolveLocale } from "@backend/features/core/domain/value-objects";
import { createSchoolServices } from "../services/factory";
import { createCatalogServices } from "@backend/features/catalog/application/services/factory";
import type { Product } from "@backend/features/catalog/domain/entities/Product";

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
  catalogServices = createCatalogServices(),
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

  const { products } = catalogServices;
  const resolved = await Promise.all(
    productIds.map(async (id) => products.getById(id, resolvedLocale)),
  );

  const productMap = new Map(
    resolved
      .filter((p: Product | null): p is Product => Boolean(p))
      .map((product: Product) => [product.id, product] as const),
  );
  const orderedProducts = productIds
    .map((id) => productMap.get(id))
    .filter((product): product is Product => Boolean(product));

  return {
    rawCode,
    normalizedCode,
    productIds,
    products: orderedProducts,
    totalEstimatedCost: orderedProducts.reduce(
      (sum, product) => sum + (product.variants?.[0]?.basePrice ?? 0),
      0,
    ),
  };
}

/**
 * Get school list page data.
 */
export async function getSchoolListPageData(slug: string, userId: number | null) {
  const { schoolLists, schoolAccess, parentList } = createSchoolServices();

  const list = await schoolLists.getListBySlug(slug);
  if (!list) return null;

  const [accessState, sessionState, fullList] = await Promise.all([
    schoolAccess.getAccessState(list.id, userId as any),
    parentList.getSessionState(list.id, userId as any),
    parentList.getListWithDetails(slug),
  ]);

  return {
    list,
    accessState,
    sessionState,
    fullList,
  };
}
