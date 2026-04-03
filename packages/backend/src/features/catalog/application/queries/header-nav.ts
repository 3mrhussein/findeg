import { getServices } from "@/server/getServices";
import type { Category } from "@/features/catalog/domain/entities/Category";
import { resolveLocale } from "@/features/core/domain/value-objects";

export interface HeaderCategoryNode {
  id: number;
  slug: string;
  name: string;
  children: HeaderCategoryNode[];
}

/**
 * Converts category entities to a normalized tree shape for header navigation.
 */
function toHeaderNode(category: Category): HeaderCategoryNode {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    children: (category.children || [])
      .filter((child) => child.isActive !== false)
      .map(toHeaderNode),
  };
}

/**
 * Returns active category tree used for fast header navigation.
 */
export async function getHeaderCategoryTree(locale: string): Promise<HeaderCategoryNode[]> {
  const resolvedLocale = resolveLocale(locale);
  const { repositories } = getServices();
  const tree = await repositories.categories.getTree(resolvedLocale);

  return tree.filter((category) => category.isActive !== false).map(toHeaderNode);
}
