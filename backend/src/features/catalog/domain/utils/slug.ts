import type { Product } from "../entities/Product";

/**
 * Resolves the primary English slug for a product.
 * Falls back to Arabic or empty string if English is missing.
 */
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

/**
 * Returns the canonical URL path for a product.
 */
export function getCanonicalProductHref(product: Product): string {
    const slug = getProductEnglishSlug(product);
    return `/shop/products/${slug || product.id}`;
}
