"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/features/catalog/domain/entities/Product";

/**
 * Column definitions for the ProductTable.
 * Accepts onDelete so the shell controls the confirmation state.
 */
export function buildProductColumns(onDelete: (id: number) => void): ColumnDef<Product>[] {
  return [
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
          {row.original.variants?.[0]?.images?.[0]?.url && (
            <Image
              src={row.original.variants[0].images[0].url}
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
        const firstVariant = row.original.variants?.[0];
        const amount = firstVariant?.basePrice ?? 0;
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
                onClick={() => onDelete(product.id)}
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
}
