"use client";

import { usePagination } from "@/hooks/usePagination";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { ProductGrid } from "@/features/catalog/presentation/components/ProductGrid";
import { Pagination } from "@/components/common/Pagination";

interface ProductPaginationProps {
  products: Product[];
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

/**
 *
 */
export function ProductPagination({
  products,
  itemsPerPage = 8,
  currentPage,
  onPageChange,
}: ProductPaginationProps) {
  const isControlled = typeof currentPage === "number" && typeof onPageChange === "function";

  const {
    currentPage: localCurrentPage,
    totalPages: localTotalPages,
    setCurrentPage: setLocalCurrentPage,
    currentPageData: localCurrentPageData,
  } = usePagination(products, itemsPerPage);

  if (isControlled) {
    const totalPages = products.length > 0 ? Math.ceil(products.length / itemsPerPage) : 1;
    const safePage = Math.min(Math.max(currentPage!, 1), totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const currentPageData = products.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="space-y-8">
        <ProductGrid products={currentPageData} />
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={onPageChange!} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProductGrid products={localCurrentPageData} />
      <Pagination
        currentPage={localCurrentPage}
        totalPages={localTotalPages}
        onPageChange={setLocalCurrentPage}
      />
    </div>
  );
}
