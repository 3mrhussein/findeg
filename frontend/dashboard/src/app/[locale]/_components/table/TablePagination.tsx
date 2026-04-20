/**
 * TablePagination Component
 *
 * Pagination controls with page size selector.
 * Consistent pagination UI for all list pages.
 *
 * Location: src/app/[locale]/admin/_components/table/ (admin-wide)
 */

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@findeg/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@findeg/ui";
import { cn } from "@lib/utils";

export interface TablePaginationProps {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total item count */
  total: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onLimitChange?: (limit: number) => void;
  /** Available page sizes */
  pageSizes?: number[];
  /** Show page size selector */
  showPageSize?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TablePagination — Pagination controls
 *
 * Features:
 * - First/Previous/Next/Last navigation
 * - Page info display
 * - Page size selector
 * - Disabled states for boundary pages
 *
 * @example
 * <TablePagination
 *   page={currentPage}
 *   limit={pageSize}
 *   total={totalProducts}
 *   onPageChange={setPage}
 *   onLimitChange={setPageSize}
 *   pageSizes={[10, 25, 50, 100]}
 * />
 */
export function TablePagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  pageSizes = [10, 25, 50, 100],
  showPageSize = true,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* Page Info */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {total} results
      </div>

      <div className="flex items-center gap-6">
        {/* Page Size Selector */}
        {showPageSize && onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page - 1)}
              disabled={!canGoPrevious}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Next Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page + 1)}
              disabled={!canGoNext}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
