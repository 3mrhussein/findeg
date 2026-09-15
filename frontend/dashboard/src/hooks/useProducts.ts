import { useState, useMemo } from 'react';
import { isNewProduct, type Product } from '@findeg/backend/features/catalog';
import type { SortOption } from '@lib/types';

/**
 * Custom hook for managing product filtering and sorting.
 *
 * @param {Product[]} initialProducts - The initial list of products.
 * @returns {object} An object containing the sorted products, current sort option, and state setters.
 */
export const useProducts = (initialProducts: Product[]) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  const sortedProducts = useMemo(() => {
    let sortable = [...filteredProducts];
    switch (sortOption) {
      case 'newest':
        sortable.sort(
          (a, b) =>
            (isNewProduct(b) ? 1 : -1) - (isNewProduct(a) ? 1 : -1),
        );
        break;
      case 'price-asc':
        sortable.sort(
          (a, b) =>
            Number(a.variants?.[0]?.basePrice ?? 0) - Number(b.variants?.[0]?.basePrice ?? 0),
        );
        break;
      case 'price-desc':
        sortable.sort(
          (a, b) =>
            Number(b.variants?.[0]?.basePrice ?? 0) - Number(a.variants?.[0]?.basePrice ?? 0),
        );
        break;
      case 'featured':
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
