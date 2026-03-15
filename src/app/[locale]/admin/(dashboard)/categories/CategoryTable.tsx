"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Category } from "@/features/catalog/domain/entities/Category";
import { Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { deleteCategoryAction } from "@/features/catalog/application/actions/category";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CategoryTableProps {
  data: Category[];
}

/**
 *
 */
export function CategoryTable({ data }: CategoryTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { toast } = useToast();
  const router = useRouter();

  /**
   *
   */
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const result = await deleteCategoryAction(id);
      if (result.success) {
        toast({ title: "Category deleted" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    }
  };

  // Convert flat list to tree structure for display
  /**
   *
   */
  const buildTree = (
    cats: Category[],
    parentId: number | null | undefined = undefined,
    depth = 0,
  ): (Category & { depth: number })[] => {
    return cats
      .filter((cat) => (parentId === undefined ? cat.parentId == null : cat.parentId === parentId))
      .reduce<(Category & { depth: number })[]>((acc, cat) => {
        return [...acc, { ...cat, depth }, ...buildTree(cats, cat.id, depth + 1)];
      }, []);
  };

  const treeData = buildTree(data);

  const columns: ColumnDef<Category & { depth: number }>[] = [
    {
      accessorKey: "id",
      header: "ID",
      /**
       *
       */
      cell: ({ row }) => <div className="w-[40px]">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      /**
       *
       */
      cell: ({ row }) => (
        <div
          className="flex items-center gap-2"
          style={{ paddingInlineStart: `${row.original.depth * 24}px` }}
        >
          {row.original.depth > 0 && <span className="text-muted-foreground me-2">└─</span>}
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      id: "actions",
      /**
       *
       */
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                  >
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      data-testid={`admin-category-edit-${category.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit category</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(category.id)}
                    data-testid={`admin-category-delete-${category.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete category</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: treeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          data-testid="admin-categories-filter-input"
          placeholder="Filter categories..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border bg-card">
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
                  data-testid={`admin-category-row-${row.original.id}`}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
