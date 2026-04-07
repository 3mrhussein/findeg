import { ProductEntity, type Product } from "@features/catalog/domain/entities/Product";
import type { Variant } from "@features/catalog/domain/entities/Variant";
import { VariantEntity } from "@features/catalog/domain/entities/Variant";

export type ProductStatusBadgeKind = "sale" | "low-stock" | "new";

export interface ProductStatusBadge {
  kind: ProductStatusBadgeKind;
  percent?: number;
}

/**
 * Shared status badge resolver used by listing and PDP image gallery.
 * Priority: sale > low stock > new.
 */
export function getProductStatusBadge(params: {
  product: Product;
  variant?: Variant;
  lowStock?: boolean;
}): ProductStatusBadge | null {
  const { product, variant, lowStock = false } = params;
  const selectedVariant =
    variant ||
    (product.variants || []).find((entry) => entry.variantKey === "default") ||
    product.variants?.[0];

  if (selectedVariant) {
    const discountPercentage = new VariantEntity(selectedVariant).getDiscountPercentage();
    if (discountPercentage > 0) {
      return {
        kind: "sale",
        percent: discountPercentage,
      };
    }
  }

  if (lowStock) {
    return { kind: "low-stock" };
  }

  if (new ProductEntity(product).isNew()) {
    return { kind: "new" };
  }

  return null;
}
