"use server";

import {
  createCatalogServices,
  type Variant,
  type PriceListEntry,
} from "@backend/features/catalog";
import { resolveLocale } from "@backend/features/core";
import { Category } from "@hooks/useCategories";

/**
 * Server action to fetch hierarchical category tree.
 *
 * Replaces the legacy /api/v1/categories REST endpoint which is no longer
 * available in the monorepo split.
 */
export async function getCategoryTreeAction(locale: string = "en"): Promise<Category[]> {
  const resolvedLocale = resolveLocale(locale);
  const { categories } = createCatalogServices();

  const allCategories = await categories.getAll(resolvedLocale);

  // Transform backend categories to the flat or tree structure expected by the UI hook
  // Currently, the UI expects the Category interface from useCategories.ts
  return allCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    parentId: c.parentId || undefined,
    icon: c.icon,
    image: c.image,
    // Note: children nesting is usually handled on the client or by specialized query
  })) as Category[];
}

/**
 * Server action to fetch real-time pricing for a specific product variant and UoM.
 */
export async function getProductPricingAction(payload: {
  productId: number;
  variantId: number;
  uom: string;
  customerGroup: string;
  quantity: number;
}) {
  const { products } = createCatalogServices();

  // Note: This logic should ideally call a specialized pricing service
  // For now, we'll implement a basic resolution similar to the legacy API
  const product = await products.getById(payload.productId);
  if (!product) return { success: false, error: "Product not found" };

  const variant = product.variants?.find((v: Variant) => v.id === payload.variantId);
  if (!variant) return { success: false, error: "Variant not found" };

  // Finding the price based on customer group and UoM
  const priceLists = variant.priceLists || [];
  const priceEntry =
    priceLists.find(
      (p: PriceListEntry) => p.customerGroup === payload.customerGroup && p.uomCode === payload.uom,
    ) ||
    priceLists.find(
      (p: PriceListEntry) => p.customerGroup === "public_b2c" && p.uomCode === payload.uom,
    );

  const unitPrice = priceEntry ? (priceEntry.unitPrice as number) : (variant.basePrice as number);

  return {
    success: true,
    data: {
      unitPrice,
      currency: "EGP",
    },
  };
}
