import { useState, useMemo } from "react";
import type { Product } from "@/domain/entities/Product";
import type { SortOption } from "@/lib/types";

/**
 * Custom hook for managing product filtering and sorting.
 *
 * @param {Product[]} initialProducts - The initial list of products.
 * @returns {object} An object containing the sorted products, current sort option, and state setters.
 */
export const useProducts = (initialProducts: Product[]) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [sortOption, setSortOption] = useState<SortOption>("featured");

  const sortedProducts = useMemo(() => {
    let sortable = [...filteredProducts];
    switch (sortOption) {
      case "newest":
        sortable.sort((a, b) => (b.isNew === true ? 1 : -1) - (a.isNew === true ? 1 : -1));
        break;
      case "price-asc":
        sortable.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortable.sort((a, b) => b.price - a.price);
        break;
      case "featured":
      default:
        break;
    }
    return sortable;
  }, [filteredProducts, sortOption]);

  return {
    sortedProducts,
    sortOption,
    setSortOption,
    setFilteredProducts,
  };
};
