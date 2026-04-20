/**
 * DataTableSkeleton Component
 *
 * Loading skeleton for table/list pages.
 * Shows 5 animated skeleton rows.
 *
 * Location: src/app/[locale]/admin/_components/shared/ (admin-wide)
 */

"use client";

import * as React from "react";
import { Skeleton } from "@findeg/ui";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@findeg/ui";
import { cn } from "@lib/utils";

export interface DataTableSkeletonProps {
  /** Number of rows to show (default: 5) */
  rows?: number;
  /** Number of columns (default: 5) */
  columns?: number;
  /** Show header row */
  showHeader?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DataTableSkeleton — Table loading state
 *
 * @example
 * <DataTableSkeleton rows={5} columns={6} />
 */
export function DataTableSkeleton({
  rows = 5,
  columns = 5,
  showHeader = true,
  className,
}: DataTableSkeletonProps) {
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton
                    className="h-4 w-full"
                    style={{
                      maxWidth:
                        colIndex === 0 ? "200px" : colIndex === columns - 1 ? "80px" : "120px",
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
