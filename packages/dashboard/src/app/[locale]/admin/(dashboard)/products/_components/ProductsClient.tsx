"use client";

import { useState, useTransition } from "react";
import { useQueryStates, parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import { useToast } from "@hooks/use-toast";
import { useTranslations } from "next-intl";
import { ProductsFilterBar } from "./ProductsFilterBar";
import { ProductsTable } from "./ProductsTable";
import { ProductsPagination } from "./ProductsPagination";
import { BulkActionsBar } from "./BulkActionsBar";
import {
  duplicateProductAction,
  bulkActivateAction,
  bulkDeactivateAction,
  bulkDeleteAction,
} from "../actions";
import type { ProductListResult, ProductListFilters } from "@backend/features/administration";

interface ProductsClientProps {
  initialData: ProductListResult;
  categories: any[];
  brands: any[];
  initialFilters: ProductListFilters;
}

/**
 * Root Client Component for Products Catalog Workspace
 *
 * Handles:
 * - URL state management via nuqs
 * - Multi-selection and bulk actions
 * - Server action coordination with toasts
 * - Loading states during transitions
 */
export function ProductsClient({ initialData, categories, brands }: ProductsClientProps) {
  const t = useTranslations("Administration.Catalog.Products");
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      categoryIds: parseAsArrayOf(parseAsInteger).withDefault([]),
      brandIds: parseAsArrayOf(parseAsInteger).withDefault([]),
      status: parseAsString.withDefault(""),
      completeness: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(20),
      sortBy: parseAsString.withDefault("updatedAt"),
      sortDir: parseAsString.withDefault("desc"),
    },
    {
      shallow: false, // Force server-side data fetching on filter change
    },
  );

  const handleDuplicate = (id: number) => {
    startTransition(async () => {
      toast({ title: t("Toasts.Duplicating") });
      const result = await duplicateProductAction(id);
      if (result) {
        toast({ title: t("Toasts.DuplicateSuccess") });
      } else {
        toast({ title: t("Toasts.DuplicateError"), variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    startTransition(async () => {
      toast({ title: t("Toasts.Deleting") });
      await bulkDeleteAction([id]);
      toast({ title: t("Toasts.DeleteSuccess") });
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    });
  };

  const handleBulkActivate = (ids: number[]) => {
    startTransition(async () => {
      toast({ title: t("Toasts.Activating") });
      await bulkActivateAction(ids);
      toast({ title: t("Toasts.ActivateSuccess") });
      setSelectedIds([]);
    });
  };

  const handleBulkDeactivate = (ids: number[]) => {
    startTransition(async () => {
      toast({ title: t("Toasts.Deactivating") });
      await bulkDeactivateAction(ids);
      toast({ title: t("Toasts.DeactivateSuccess") });
      setSelectedIds([]);
    });
  };

  const handleBulkDelete = (ids: number[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} products?`)) return;
    startTransition(async () => {
      toast({ title: t("Toasts.Deleting") });
      await bulkDeleteAction(ids);
      toast({ title: t("Toasts.DeleteSuccess") });
      setSelectedIds([]);
    });
  };

  return (
    <div
      className={isPending ? "opacity-70 pointer-events-none transition-opacity duration-200" : ""}
    >
      <ProductsFilterBar
        filters={{
          search: filters.search,
          categoryIds: filters.categoryIds,
          brandIds: filters.brandIds,
          status: filters.status,
          completeness: filters.completeness,
        }}
        setFilters={setFilters}
        categories={categories}
        brands={brands}
      />

      <div className="mt-4">
        <ProductsTable
          products={initialData.products}
          total={initialData.total}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </div>

      <div className="mt-4">
        <ProductsPagination
          total={initialData.total}
          filters={{
            page: filters.page,
            pageSize: filters.pageSize,
          }}
          setFilters={setFilters}
        />
      </div>

      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
      />
    </div>
  );
}
