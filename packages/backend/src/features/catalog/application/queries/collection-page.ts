import { createCatalogServices } from "../services/factory";
import { resolveLocale } from "@features/core/domain/value-objects";
import { Product } from "@features/catalog/domain/entities/Product";
import { Collection } from "@features/catalog/domain/entities/Collection";
import {
  applyListingFilters,
  buildBrandOptions,
  buildCategoryTree,
  FilterOption,
  CategoryFilterOption,
  getPriceBounds,
  parseListingFilters,
} from "./listing";

export interface CollectionPageViewModel {
  collection: Collection;
  products: Product[];
  filteredProducts: Product[];
  categoryOptions: CategoryFilterOption[];
  brandOptions: FilterOption[];
  minPrice: number;
  maxPrice: number;
}

/**
 * Builds the view model for the Collection Detail page.
 */
export async function getCollectionPageViewModel(
  slug: string,
  locale: string,
  query: { [key: string]: string | string[] | undefined },
): Promise<CollectionPageViewModel | null> {
  const resolvedLocale = resolveLocale(locale);
  const { collections, products, categories } = createCatalogServices();

  const collection = await collections.getCollectionBySlug(slug);
  if (!collection) return null;

  // Fetch all products that belong to this collection
  const { products: collectionProducts } = await products.getFilteredProducts(
    { collectionId: collection.id },
    resolvedLocale,
  );

  const allCategories = await categories.getAll(resolvedLocale);

  const { minPrice, maxPrice } = getPriceBounds(collectionProducts);
  const categoryOptions = buildCategoryTree(allCategories, collectionProducts);
  const brandOptions = buildBrandOptions(collectionProducts);
  const filters = parseListingFilters(query, [minPrice, maxPrice]);

  const filtered = applyListingFilters({
    products: collectionProducts,
    categories: allCategories,
    filters,
  });

  return {
    collection,
    products: collectionProducts,
    filteredProducts: filtered,
    categoryOptions,
    brandOptions,
    minPrice,
    maxPrice,
  };
}
