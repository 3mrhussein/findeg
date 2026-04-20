import { ProductEntity, type Product } from "@findeg/backend/features/catalog/domain/entities/Product";

export interface HomeFeaturedGroups {
  all: Product[];
  newest: Product[];
  topRated: Product[];
}

/**
 * Builds curated featured product groups for home-page tabbed browsing.
 */
export function buildHomeFeaturedGroups(products: Product[]): HomeFeaturedGroups {
  const all = products;
  const newest = products.filter((product) => new ProductEntity(product).isNew());
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);

  return {
    all,
    newest,
    topRated,
  };
}
