"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Product } from "@/features/catalog/domain/entities/Product";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { deleteProductAction } from "@/features/catalog/application/actions/product";
import { useToast } from "@/hooks/use-toast";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductTableProps {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  filters: {
    search: string;
    categoryId?: number;
    brandId?: number;
    isActive: string;
  };
  categories: Array<{ id: number; name: string }>;
  brands: Array<{ id: number; name: string }>;
}

/**
 *
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
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const updateQuery = (next: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: string;
    page?: string;
  }) => {
    const params = new URLSearchParams();

    const nextSearch = (next.search ?? filters.search).trim();
    const nextCategoryId = next.categoryId ?? (filters.categoryId ? String(filters.categoryId) : "");
    const nextBrandId = next.brandId ?? (filters.brandId ? String(filters.brandId) : "");
    const nextIsActive = next.isActive ?? filters.isActive;
    const nextPage = next.page ?? "1";

    if (nextSearch) params.set("search", nextSearch);
    if (nextCategoryId) params.set("categoryId", nextCategoryId);
    if (nextBrandId) params.set("brandId", nextBrandId);
    if (nextIsActive && nextIsActive !== "all") params.set("isActive", nextIsActive);
    params.set("page", nextPage);
    params.set("limit", String(limit));

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "An unexpected error occurred while deleting the product.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Product>[] = [
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
        <div className="flex items-center gap-2">
          {row.original.images?.[0] && (
            <Image
              src={row.original.images[0]}
              alt={row.getValue("name")}
              width={32}
              height={32}
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
    },
    {
      accessorKey: "price",
      header: "Price",
      /**
       *
       */
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "isNew",
      header: "Status",
      /**
       *
       */
      cell: ({ row }) =>
        row.original.isNew ? (
          <Badge variant="default">New</Badge>
        ) : (
          <Badge variant="secondary">Standard</Badge>
        ),
    },
    {
      id: "actions",
      /**
       *
       */
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`admin-product-actions-${product.id}`}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(product.id))}>
                Copy Product ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  data-testid={`admin-product-edit-${product.id}`}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteId(product.id)}
                data-testid={`admin-product-delete-${product.id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 py-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          data-testid="admin-products-filter-search"
          placeholder="Search name, SKU, description..."
          defaultValue={filters.search}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateQuery({ search: (event.target as HTMLInputElement).value, page: "1" });
            }
          }}
        />
        <Select
          value={filters.categoryId ? String(filters.categoryId) : "all"}
          onValueChange={(value) =>
            updateQuery({ categoryId: value === "all" ? "" : value, page: "1" })
          }
        >
          <SelectTrigger data-testid="admin-products-filter-category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.brandId ? String(filters.brandId) : "all"}
          onValueChange={(value) => updateQuery({ brandId: value === "all" ? "" : value, page: "1" })}
        >
          <SelectTrigger data-testid="admin-products-filter-brand">
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={String(brand.id)}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.isActive || "all"}
          onValueChange={(value) => updateQuery({ isActive: value, page: "1" })}
        >
          <SelectTrigger data-testid="admin-products-filter-status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="true">Active only</SelectItem>
            <SelectItem value="false">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {total} products
        </div>
        <Button
          data-testid="admin-products-filter-clear"
          variant="outline"
          onClick={() =>
            updateQuery({
              search: "",
              categoryId: "",
              brandId: "",
              isActive: "all",
              page: "1",
            })
          }
        >
          Clear filters
        </Button>
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
                  data-testid={`admin-product-row-${row.original.id}`}
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateQuery({ page: String(Math.max(1, page - 1)) })}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateQuery({ page: String(Math.min(totalPages, page + 1)) })}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove the product.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              data-testid="admin-product-delete-confirm"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
