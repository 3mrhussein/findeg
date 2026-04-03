import type { Category } from "@/features/catalog/domain/entities/Category";
import type { Product } from "@/features/catalog/domain/entities/Product";

/**
 * Computes product counts for each category including descendant categories.
 */
export function countProductsByCategoryHierarchy(
  categories: Category[],
  products: Product[],
): Record<number, number> {
  const categoryPathById = new Map(
    categories.map((category) => [category.id, category.path || ""]),
  );
  const productCategoryPathByProductId = new Map<number, string>();

  for (const product of products) {
    if (typeof product.categoryId !== "number") continue;
    const path = categoryPathById.get(product.categoryId);
    if (!path) continue;
    productCategoryPathByProductId.set(product.id, path);
  }

  const counts: Record<number, number> = {};

  for (const category of categories) {
    const categoryPath = category.path || "";
    if (!categoryPath) {
      counts[category.id] = 0;
      continue;
    }

    let count = 0;
    for (const productPath of productCategoryPathByProductId.values()) {
      if (productPath.startsWith(categoryPath)) {
        count += 1;
      }
    }
    counts[category.id] = count;
  }

  return counts;
}
