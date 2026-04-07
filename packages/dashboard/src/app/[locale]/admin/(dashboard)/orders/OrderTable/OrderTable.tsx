"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { OrderTableProps, UpdateOrderQueryParams } from "./OrderTable.interface";
import { buildOrderColumns } from "./OrderTableColumns";
import { OrderTableFilters } from "./OrderTableFilters";
import { OrderTablePagination } from "./OrderTablePagination";
import { OrderStatusPills } from "./OrderStatusPills";
import { OrderBulkActionBar } from "./OrderBulkActionBar";

/**
 *
 */
export function OrderTable({ data, page, limit, total, statusCounts, filters }: OrderTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(total / limit));

  /**
   *
   */
  const updateQuery = (next: UpdateOrderQueryParams) => {
    const params = new URLSearchParams();
    const nextSearch = (next.search ?? filters.search ?? "").trim();
    const nextStatus = next.status ?? filters.status;
    const nextPaymentStatus = next.paymentStatus ?? filters.paymentStatus;
    const nextPage = next.page ?? "1";

    if (nextSearch) params.set("search", nextSearch);
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextPaymentStatus && nextPaymentStatus !== "all")
      params.set("paymentStatus", nextPaymentStatus);

    // Add date format if needed
    if (next.startDate) params.set("startDate", next.startDate);
    else if (filters.startDate) params.set("startDate", filters.startDate.toISOString());

    if (next.endDate) params.set("endDate", next.endDate);
    else if (filters.endDate) params.set("endDate", filters.endDate.toISOString());

    params.set("page", nextPage);
    params.set("limit", String(limit));

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const columns = buildOrderColumns();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="space-y-4">
      <OrderStatusPills
        statusCounts={statusCounts}
        activeStatus={filters.status || "all"}
        onStatusChange={(status) => updateQuery({ status, page: "1" })}
        total={total}
      />

      <OrderTableFilters
        filters={filters}
        onFilterChange={(key, value) => updateQuery({ [key]: value, page: "1" })}
        onClear={() =>
          updateQuery({
            search: "",
            status: "all",
            paymentStatus: "all",
            startDate: undefined,
            endDate: undefined,
            page: "1",
          })
        }
        isPending={isPending}
        total={total}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    row.original.status === "processing" || row.original.status === "pending"
                      ? "hover:bg-amber-500/10" // Tinting for stuck or specific orders could be added here
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <OrderTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => updateQuery({ page: String(p) })}
        isPending={isPending}
      />

      <OrderBulkActionBar table={table} />
    </div>
  );
}
