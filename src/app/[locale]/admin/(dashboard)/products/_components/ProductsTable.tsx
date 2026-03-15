/**
 * ProductsTable — Main products table using EnrichedTable pattern
 * Uses ProductRow components with expand/collapse and checkbox selection
 */

"use client";

import * as React from "react";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { EnrichedTable } from "@/app/[locale]/admin/_components/table/EnrichedTable";
import { ProductRow } from "./ProductRow";
import {
  BulkActionsBar,
  type BulkAction,
} from "@/app/[locale]/admin/_components/shared/BulkActionsBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Package } from "lucide-react";

import type { Category } from "@/features/catalog/domain/entities/Category";
import type { Brand } from "@/features/catalog/domain/entities/Brand";
import { TableFilters, type Filter } from "@/app/[locale]/admin/_components/table/TableFilters";
import { TablePagination } from "@/app/[locale]/admin/_components/table/TablePagination";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

interface ProductsTableProps {
  products: Product[];
  total: number;
  categories: Category[];
  brands: Brand[];
  currentSearch?: string;
  currentCategoryId?: number;
  currentBrandId?: number;
  currentIsActive?: boolean;
  currentPage: number;
  currentLimit: number;
}

export function ProductsTable({
  products,
  total,
  categories,
  brands,
  currentSearch = "",
  currentCategoryId,
  currentBrandId,
  currentIsActive,
  currentPage,
  currentLimit,
}: ProductsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState(currentSearch);
  const debouncedSearch = useDebounce(search, 500);

  const updateQuery = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  // Sync debounced search to URL
  React.useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateQuery({ search: debouncedSearch || undefined, page: "1" });
    }
  }, [debouncedSearch, currentSearch, updateQuery]);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => String(p.id))));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on`, Array.from(selectedIds));
    // TODO: Implement bulk actions
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const bulkActions: BulkAction[] = [
    { key: "activate", label: "Activate", onClick: () => handleBulkAction("activate") },
    { key: "deactivate", label: "Deactivate", onClick: () => handleBulkAction("deactivate") },
    { key: "export", label: "Export", onClick: () => handleBulkAction("export") },
    {
      key: "archive",
      label: "Archive",
      onClick: () => handleBulkAction("archive"),
      variant: "destructive" as const,
    },
  ];

  const filters: Filter[] = [
    {
      key: "categoryId",
      label: "Category",
      value: String(currentCategoryId || "all"),
      options: [
        { value: "all", label: "All Categories" },
        ...categories.map((c) => ({ value: String(c.id), label: c.name })),
      ],
      onChange: (v) => updateQuery({ categoryId: v, page: "1" }),
    },
    {
      key: "brandId",
      label: "Brand",
      value: String(currentBrandId || "all"),
      options: [
        { value: "all", label: "All Brands" },
        ...brands.map((b) => ({ value: String(b.id), label: b.name })),
      ],
      onChange: (v) => updateQuery({ brandId: v, page: "1" }),
    },
    {
      key: "isActive",
      label: "Status",
      value: currentIsActive === undefined ? "all" : String(currentIsActive),
      options: [
        { value: "all", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Draft" },
      ],
      onChange: (v) => updateQuery({ isActive: v, page: "1" }),
    },
  ];

  return (
    <div className="space-y-4">
      <TableFilters
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU..."
        filters={filters}
        showClear={
          search !== "" ||
          currentCategoryId !== undefined ||
          currentBrandId !== undefined ||
          currentIsActive !== undefined
        }
        onClearAll={() => {
          setSearch("");
          router.push(pathname);
        }}
      />

      <div className="relative">
        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try adjusting your filters or create a new product."
          />
        ) : (
          <EnrichedTable
            columns={[
              { key: "image", label: "", width: "w-16" },
              { key: "product", label: "Product", width: "flex-1" },
              { key: "category", label: "Category", width: "w-40" },
              { key: "brand", label: "Brand", width: "w-32" },
              { key: "price", label: "Price", width: "w-28" },
              { key: "stock", label: "Stock", width: "w-24" },
              { key: "status", label: "Status", width: "w-28" },
              { key: "updated", label: "Updated", width: "w-36" },
            ]}
            showCheckbox
            showExpand
          >
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                columnCount={10} // Checkbox(1), Expand(1), Image(1), Product(1), Category(1), Brand(1), Price(1), Stock(1), Status(1), Updated(1)
                isSelected={selectedIds.has(String(product.id))}
                onSelect={(selected) => handleSelect(String(product.id), selected)}
              />
            ))}
          </EnrichedTable>
        )}

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            actions={bulkActions}
            onClear={handleClearSelection}
          />
        )}
      </div>

      <TablePagination
        page={currentPage}
        limit={currentLimit}
        total={total}
        onPageChange={(p) => updateQuery({ page: String(p) })}
        onLimitChange={(l) => updateQuery({ limit: String(l), page: "1" })}
      />
    </div>
  );
}
