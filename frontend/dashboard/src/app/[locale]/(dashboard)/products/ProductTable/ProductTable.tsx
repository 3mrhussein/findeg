"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "@i18n/navigation";
import { deleteProductAction, setProductStatusAction } from "@actions/admin-actions";
import { useToast } from "@hooks/use-toast";
import type { ProductTableProps, UpdateQueryParams } from "./ProductTable.interface";
import { buildProductColumns } from "./ProductTableColumns";
import { ProductTableFilters } from "./ProductTableFilters";
import { ProductTablePagination } from "./ProductTablePagination";
import { ProductDeleteDialog } from "./ProductDeleteDialog";
import { ProductBulkActionBar } from "./ProductBulkActionBar";

/**
 * ProductTable — orchestrates filter toolbar, data grid, pagination, and delete dialog.
 */
export function ProductTable({
  data,
  page,
  limit,
  total,
  filters,
  categories,
  brands,
}: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(total / limit));

  /**
   *
   */
  const updateQuery = (next: UpdateQueryParams) => {
    const params = new URLSearchParams();
    const nextSearch = (next.search ?? filters.search).trim();
    const nextCategoryId =
      next.categoryId ?? (filters.categoryId ? String(filters.categoryId) : "");
    const nextBrandId = next.brandId ?? (filters.brandId ? String(filters.brandId) : "");
    const nextIsActive = next.isActive ?? filters.isActive;
    const nextStockLevel = next.stockLevel ?? filters.stockLevel;
    const nextPage = next.page ?? "1";

    if (nextSearch) params.set("search", nextSearch);
    if (nextCategoryId) params.set("categoryId", nextCategoryId);
    if (nextBrandId) params.set("brandId", nextBrandId);
    if (nextIsActive && nextIsActive !== "all") params.set("isActive", nextIsActive);
    if (nextStockLevel && nextStockLevel !== "all") params.set("stockLevel", nextStockLevel);
    params.set("page", nextPage);
    params.set("limit", String(limit));

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  /**
   *
   */
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteProductAction(deleteId);
      if (result.success) {
        toast({ title: "Product deleted", description: "The product was deleted successfully." });
        setDeleteId(null);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: result.error || "Unable to delete product.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "An unexpected error occurred while deleting the product.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = buildProductColumns(setDeleteId);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, rowSelection },
  });

  const selectedIds = table.getSelectedRowModel().flatRows.map((r: any) => r.original.id);

  return (
    <div className="space-y-4">
      <ProductTableFilters
        filters={filters}
        total={total}
        shown={data?.length || 0}
        categories={categories}
        brands={brands}
        onUpdate={updateQuery}
      />

      <div
        className={`rounded-md border bg-card transition-opacity relative ${isPending ? "opacity-50 pointer-events-none" : ""}`}
      >
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  data-testid={`admin-product-row-${row.original.id}`}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => updateQuery({ page: String(p) })}
      />

      <ProductDeleteDialog
        open={deleteId !== null}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ProductBulkActionBar
        selectedIds={selectedIds}
        onClearSelection={() => setRowSelection({})}
      />
    </div>
  );
}
