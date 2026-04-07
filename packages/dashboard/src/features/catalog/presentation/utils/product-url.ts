import type { Product } from "@backend/features/catalog";

export function getProductEnglishSlug(product: Product): string | null {
  const candidate =
    (product.localizedContent?.slug as Record<string, string> | undefined)?.en ||
    (product.localizedContent?.slug as Record<string, string> | undefined)?.ar ||
    "";

  const normalized = candidate
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || null;
}

export function getCanonicalProductHref(product: Product): string {
  const slug = getProductEnglishSlug(product);
  return `/shop/products/${slug || product.id}`;
}
