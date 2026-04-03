"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface OrderTablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
}

/**
 *
 */
export function OrderTablePagination({
  page,
  totalPages,
  onPageChange,
  isPending,
}: OrderTablePaginationProps) {
  if (totalPages <= 1) return null;

  /**
   *
   */
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={page === i ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i)}
            disabled={isPending}
            className="w-8 h-8 p-0"
          >
            {i}
          </Button>,
        );
      }
    } else {
      // Logic for ellipsis
      pages.push(
        <Button
          key={1}
          variant={page === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={isPending}
          className="w-8 h-8 p-0"
        >
          1
        </Button>,
      );

      if (page > 3) {
        pages.push(
          <span key="ellipsis-1" className="px-2">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </span>,
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(
          <Button
            key={i}
            variant={page === i ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i)}
            disabled={isPending}
            className="w-8 h-8 p-0"
          >
            {i}
          </Button>,
        );
      }

      if (page < totalPages - 2) {
        pages.push(
          <span key="ellipsis-2" className="px-2">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </span>,
        );
      }

      pages.push(
        <Button
          key={totalPages}
          variant={page === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={isPending}
          className="w-8 h-8 p-0"
        >
          {totalPages}
        </Button>,
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isPending}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>

        <div className="flex items-center space-x-1">{renderPageNumbers()}</div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isPending}
        >
          <span className="sr-only">Next Page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
