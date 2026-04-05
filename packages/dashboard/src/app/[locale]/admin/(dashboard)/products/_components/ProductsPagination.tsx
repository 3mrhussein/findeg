"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@findeg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@findeg/ui";
import { cn } from "@/lib/utils";
import { Options } from "nuqs";

interface ProductsPaginationProps {
  total: number;
  filters: {
    page: number;
    pageSize: number;
  };
  setFilters: (
    values: Partial<{ page: number | null; pageSize: number | null }>,
    options?: Options,
  ) => Promise<URLSearchParams>;
}

/**
 * Build a list of page numbers to show, with ellipsis gaps.
 * Always shows first page, last page, and up to 3 pages around the current.
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export function ProductsPagination({ total, filters, setFilters }: ProductsPaginationProps) {
  const t = useTranslations("Administration.Catalog.Products");

  const totalPages = Math.ceil(total / filters.pageSize);
  const start = total > 0 ? (filters.page - 1) * filters.pageSize + 1 : 0;
  const end = Math.min(filters.page * filters.pageSize, total);

  const pageNumbers = getPageNumbers(filters.page, totalPages);

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
      {/* Showing X–Y of Z */}
      <p className="text-sm text-gray-500">
        {total > 0 ? `Showing ${start}–${end} of ${total} products` : "No products to show"}
      </p>

      <div className="flex items-center gap-6 lg:gap-8">
        {/* Items per page */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium hidden sm:block">{t("Pagination.ItemsPerPage")}</p>
          <Select
            value={`${filters.pageSize}`}
            onValueChange={(value) => {
              setFilters({ pageSize: Number(value), page: 1 });
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={filters.pageSize} />
            </SelectTrigger>
            <SelectContent align="end">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation with numbered buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setFilters({ page: filters.page - 1 })}
            disabled={filters.page <= 1}
          >
            <span className="sr-only">{t("Pagination.Previous")}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((pageNum, idx) =>
            pageNum === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={filters.page === pageNum ? "default" : "outline"}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  filters.page === pageNum && "pointer-events-none",
                )}
                onClick={() => setFilters({ page: pageNum })}
              >
                {pageNum}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setFilters({ page: filters.page + 1 })}
            disabled={filters.page >= totalPages}
          >
            <span className="sr-only">{t("Pagination.Next")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
