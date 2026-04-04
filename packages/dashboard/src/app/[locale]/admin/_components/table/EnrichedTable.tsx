/**
 * EnrichedTable Component
 *
 * Base table wrapper for enriched table pattern.
 * Manages expansion state and provides consistent table structure.
 *
 * Location: src/app/[locale]/admin/_components/table/ (admin-wide)
 */

"use client";

import * as React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@findeg/ui";
import { cn } from "@/lib/utils";

export interface Column {
  /** Column key */
  key: string;
  /** Column label */
  label: string;
  /** Column width (CSS class or style) */
  width?: string;
  /** Align content */
  align?: "left" | "center" | "right";
}

export interface EnrichedTableProps {
  /** Table columns */
  columns: Column[];
  /** Table rows (children) */
  children: React.ReactNode;
  /** Show checkbox column */
  showCheckbox?: boolean;
  /** Show expand column */
  showExpand?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EnrichedTable — Table wrapper with consistent structure
 *
 * Features:
 * - Consistent header structure
 * - Optional checkbox column
 * - Optional expand/collapse column
 * - Manages column widths
 *
 * @example
 * <EnrichedTable
 *   columns={[
 *     { key: 'product', label: 'Product', width: 'w-64' },
 *     { key: 'stock', label: 'Stock', width: 'w-24', align: 'right' },
 *     { key: 'status', label: 'Status', width: 'w-32' },
 *   ]}
 *   showCheckbox
 *   showExpand
 * >
 *   {products.map(p => <ProductRow key={p.id} product={p} />)}
 * </EnrichedTable>
 */
export function EnrichedTable({
  columns,
  children,
  showCheckbox = false,
  showExpand = false,
  className,
}: EnrichedTableProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {/* Checkbox Header */}
            {showCheckbox && (
              <TableHead className="w-12">
                {/* Master checkbox can be added here if needed */}
              </TableHead>
            )}

            {/* Expand/Collapse Header */}
            {showExpand && <TableHead className="w-12" />}

            {/* Data Columns */}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  column.width,
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}
