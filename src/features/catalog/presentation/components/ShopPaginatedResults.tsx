"use client";

import { useEffect } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { ProductPagination } from "@/components/common/ProductPagination";

interface ShopPaginatedResultsProps {
  products: Product[];
  itemsPerPage?: number;
}

/**
 * Shop-specific paginated results controlled by URL query state (`page`).
 */
export function ShopPaginatedResults({ products, itemsPerPage = 8 }: ShopPaginatedResultsProps) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withOptions({ shallow: false }).withDefault(1),
  );
  const totalPages = products.length > 0 ? Math.ceil(products.length / itemsPerPage) : 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);

  useEffect(() => {
    if (page === safePage) return;
    void setPage(safePage === 1 ? null : safePage);
  }, [page, safePage, setPage]);

  return (
    <ProductPagination
      products={products}
      itemsPerPage={itemsPerPage}
      currentPage={safePage}
      onPageChange={(nextPage) => {
        void setPage(nextPage === 1 ? null : nextPage);
      }}
    />
  );
}
