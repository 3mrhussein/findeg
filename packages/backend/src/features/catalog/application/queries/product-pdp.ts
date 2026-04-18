import type { Locale } from "@features/core/domain/value-objects";
import type { Product } from "@features/catalog/domain/entities/Product";
import type { Category } from "@features/catalog/domain/entities/Category";
import type { Variant } from "@features/catalog/domain/entities/Variant";
import type { ProductReviewSummary } from "@features/review/application/interfaces/IReviewRepository";
import type { Review } from "@features/review/domain/entities/Review";
import type { CustomerGroup } from "@features/core/domain/types/common";
import { VariantEntity } from "@features/catalog/domain/entities/Variant";
import { resolveLocale } from "@features/core/domain/value-objects";
import { getProductEnglishSlug } from "@features/catalog/domain/utils/slug";
import { createCatalogServices } from "../services/factory";
import { createReviewServices } from "@features/review";
import { createIdentityServices } from "@features/identity";
import type { SessionPayload } from "@features/core/domain/auth";

export interface ProductBreadcrumbItem {
  label: string;
  href?: string;
}

export interface ProductBrandInfo {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface ProductStockSnapshot {
  inStock: boolean;
  lowStock: boolean;
  availableUnits: number;
}

export interface ProductPdpViewModel {
  locale: Locale;
  product: Product;
  brand?: ProductBrandInfo;
  canonicalSlug: string;
  canonicalPath: string;
  shouldRedirect: boolean;
  customerGroup: CustomerGroup;
  breadcrumbs: ProductBreadcrumbItem[];
  selectedVariant?: Variant;
  stockSnapshot: ProductStockSnapshot;
  relatedProducts: Product[];
  reviewSummary: ProductReviewSummary;
  initialReviews: Review[];
  reviewTotal: number;
}

interface ProductPdpLookupResult {
  product: Product;
  canonicalSlug: string;
  shouldRedirect: boolean;
}

/**
 *
 */
function resolveCustomerGroupFromSession(
  session: {
    organizationId?: string;
    activeRoleIds?: string[];
  } | null,
): CustomerGroup {
  if (!session) return "public_b2c";

  const roleIds = session.activeRoleIds || [];
  const hasSchoolRole = roleIds.some(
    (roleId) => roleId === "school_liaison" || roleId.startsWith("school_"),
  );

  if (session.organizationId || hasSchoolRole) {
    return "school_b2b";
  }

  return "public_b2c";
}

/**
 *
 */
function parseCategoryPath(path?: string): number[] {
  if (!path) return [];
  return path
    .split("/")
    .map((segment) => Number.parseInt(segment, 10))
    .filter((value) => Number.isInteger(value) && value > 0);
}

/**
 *
 */
function hasExplicitInventory(product: Product): boolean {
  return (product.variants || []).some((variant: Variant) => (variant.inventory?.length ?? 0) > 0);
}

/**
 *
 */
function getPrimaryVariant(product: Product): Variant | undefined {
  const variants = product.variants || [];
  return variants.find((variant: Variant) => variant.variantKey === "default") || variants[0];
}

/**
 *
 */
function getStockSnapshot(product: Product): ProductStockSnapshot {
  if (!hasExplicitInventory(product)) {
    return {
      inStock: true,
      lowStock: false,
      availableUnits: 0,
    };
  }

  const variant = getPrimaryVariant(product);
  if (!variant) {
    return {
      inStock: false,
      lowStock: false,
      availableUnits: 0,
    };
  }

  const entity = new VariantEntity(variant);
  return {
    inStock: entity.isInStock(),
    lowStock: entity.isLowStock(),
    availableUnits: entity.getAvailableStock(),
  };
}

/**
 *
 */
async function resolveProductLookup(
  locale: Locale,
  slug: string,
): Promise<ProductPdpLookupResult | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  const { products } = createCatalogServices();
  const product = /^\d+$/.test(normalizedSlug)
    ? await products.getById(Number(normalizedSlug), locale)
    : await products.getBySlug(normalizedSlug, locale);

  if (!product) {
    return null;
  }

  const canonicalSlug = getProductEnglishSlug(product) || String(product.id);

  return {
    product,
    canonicalSlug,
    shouldRedirect: normalizedSlug !== canonicalSlug,
  };
}

/**
 * Reads and composes storefront PDP data for /shop/products/[slug].
 */
export async function getProductPdpViewModel(
  locale: string,
  slug: string,
  session: SessionPayload | null = null,
): Promise<ProductPdpViewModel | null> {
  const resolvedLocale = resolveLocale(locale);
  const lookup = await resolveProductLookup(resolvedLocale as Locale, slug);
  if (!lookup) {
    return null;
  }

  const { product, canonicalSlug, shouldRedirect } = lookup;
  const canonicalPath = `/shop/products/${canonicalSlug}`;

  const { products, categories } = createCatalogServices();
  const { auth } = createIdentityServices();
  const { reviews } = createReviewServices();

  const [allCategories, reviewResult] = await Promise.all([
    categories.getAll(resolvedLocale),
    reviews.getProductReviews(product.id, { page: 1, limit: 10 }),
  ]);

  const customerGroup = resolveCustomerGroupFromSession(session);

  let brand: ProductBrandInfo | undefined;
  if (product.brandId) {
    const { brands } = createCatalogServices();
    const resolvedBrand = await brands.getById(product.brandId, resolvedLocale);
    if (resolvedBrand) {
      brand = {
        id: resolvedBrand.id,
        name: resolvedBrand.name,
        slug: resolvedBrand.slug,
        logoUrl: resolvedBrand.logoUrl,
      };
    }
  }

  const categoriesById = new Map<number, Category>(
    allCategories.map((category: Category) => [category.id, category]),
  );
  const categoryNode = product.categoryId ? categoriesById.get(product.categoryId) : undefined;
  const categoryIds = parseCategoryPath(categoryNode?.path);

  const breadcrumbs: ProductBreadcrumbItem[] = [{ label: "Home", href: "/" }];
  const slugSegments: string[] = [];

  for (const categoryId of categoryIds) {
    const category = categoriesById.get(categoryId) as Category | undefined;
    if (!category) continue;

    slugSegments.push(category.slug);
    breadcrumbs.push({
      label: category.name,
      href: `/shop/${slugSegments.join("/")}`,
    });
  }

  breadcrumbs.push({ label: product.name });

  const selectedVariant = getPrimaryVariant(product);
  const stockSnapshot = getStockSnapshot(product);

  const relatedProducts = product.categoryId
    ? (await products.getByCategory(product.categoryId, resolvedLocale))
        .filter((candidate) => candidate.id !== product.id)
        .slice(0, 12)
    : [];

  return {
    locale: resolvedLocale,
    product,
    brand,
    canonicalSlug,
    canonicalPath,
    shouldRedirect,
    customerGroup,
    breadcrumbs,
    selectedVariant,
    stockSnapshot,
    relatedProducts,
    reviewSummary: reviewResult.summary,
    initialReviews: reviewResult.reviews,
    reviewTotal: reviewResult.total,
  };
}

/**
 * Generates top EN product slugs for static params.
 */
export async function getTopProductSlugsForStaticParams(
  limit: number = 120,
  catalogServices = createCatalogServices(),
): Promise<string[]> {
  const { products } = catalogServices;
  const allProducts = await products.getAll("en");

  return allProducts
    .filter((product) => product.isActive !== false)
    .sort((a: Product, b: Product) => {
      const reviewsDelta = (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (reviewsDelta !== 0) return reviewsDelta;

      const ratingDelta = (b.rating || 0) - (a.rating || 0);
      if (ratingDelta !== 0) return ratingDelta;

      return Number(b.id) - Number(a.id);
    })
    .slice(0, limit)
    .map((product) => getProductEnglishSlug(product) || String(product.id));
}

/**
 * Lightweight helper for metadata generation from slug.
 */
export async function getProductBySlugOrIdForMetadata(
  locale: string,
  slug: string,
): Promise<Product | null> {
  const resolvedLocale = resolveLocale(locale);
  const lookup = await resolveProductLookup(resolvedLocale as Locale, slug);
  return lookup?.product || null;
}
