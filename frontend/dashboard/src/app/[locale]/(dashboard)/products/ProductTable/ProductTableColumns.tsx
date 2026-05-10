'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { IconTooltip } from '@findeg/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@findeg/ui';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Link } from '@i18n/navigation';
import type { Product } from '@findeg/backend/features/catalog';
import Image from 'next/image';
import { Checkbox } from '@findeg/ui';
import { Copy, Archive } from 'lucide-react';
import { VariantEntity } from '@findeg/backend/features/catalog';

/**
 * Column definitions for the ProductTable.
 * Accepts onDelete so the shell controls the confirmation state.
 */
export function buildProductColumns(onDelete: (id: number) => void): ColumnDef<Product>[] {
  return [
    {
      id: 'select',
      /**
       *
       */
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      /**
       *
       */
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'Image',
      header: 'Image',
      /**
       *
       */
      cell: ({ row }) => {
        const product = row.original;
        const variants = product.variants || [];
        const firstImage = variants[0]?.images?.[0];

        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted overflow-hidden">
            {firstImage?.url ? (
              <Image
                src={firstImage.url}
                alt={product.name || 'Product image'}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No img</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      /**
       *
       */
      cell: ({ row }) => {
        const product = row.original;
        const defaultVariant =
          product.variants?.find((v) => v.variantKey === 'default') || product.variants?.[0];
        const skuInfo = defaultVariant?.sku || product.skuPrefix || 'No SKU';
        return (
          <div className="flex flex-col">
            <Link
              href={`/products/${product.id}/edit`}
              className="font-medium hover:underline text-primary"
            >
              {product.name}
            </Link>
            <span className="text-xs text-muted-foreground">{skuInfo}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      /**
       *
       */
      cell: ({ row }) => <span className="text-sm">{row.original.categoryName || '—'}</span>,
    },
    {
      accessorKey: 'brandName',
      header: 'Brand',
      /**
       *
       */
      cell: ({ row }) => <span className="text-sm">{row.original.brandName || '—'}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      /**
       *
       */
      cell: ({ row }) => {
        const product = row.original;
        const variants = product.variants || [];
        const defaultVariant = variants.find((v) => v.variantKey === 'default') || variants[0];

        if (!defaultVariant) return '—';

        const amount = Number(defaultVariant.basePrice ?? 0);
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EGP',
        }).format(amount);

        // Show + tooltip if multiple variants
        if (variants.length > 1) {
          return (
            <IconTooltip label={`And ${variants.length - 1} other variants`}>
              <div className="text-right font-medium cursor-help">
                {formatted} <span className="text-muted-foreground text-xs">+</span>
              </div>
            </IconTooltip>
          );
        }
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: 'stock',
      header: 'Stock',
      /**
       *
       */
      cell: ({ row }) => {
        const product = row.original;
        const variants = product.variants || [];
        const totalStock = variants.reduce((acc, v) => {
          if (!v.inventory) return acc;
          return acc + v.inventory.reduce((sum, bal) => sum + (bal.onHand - bal.reserved), 0);
        }, 0);

        let dotColor = 'bg-green-500';
        if (totalStock === 0) dotColor = 'bg-red-500';
        else if (totalStock < 10) dotColor = 'bg-amber-500';

        return (
          <div className="flex items-center justify-end gap-2">
            <span className="font-medium">{totalStock}</span>
            <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      /**
       *
       */
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      /**
       *
       */
      cell: ({ row }) => {
        const date = row.original.updatedAt;
        if (!date) return '—';
        return (
          <div className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(new Date(date))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      /**
       *
       */
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <IconTooltip label="Open actions menu" asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  data-testid={`admin-product-actions-${product.id}`}
                  aria-label="Open actions menu"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </IconTooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(product.id))}>
                Copy Product ID
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/products/${product.id}/edit`}
                  data-testid={`admin-product-edit-${product.id}`}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/${product.locale || 'en'}/products/${product.slug || product.id}`}
                  target="_blank"
                >
                  <Copy className="mr-2 h-4 w-4" /> View on site
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Duplicate not yet implemented')}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Archive not yet implemented')}>
                <Archive className="mr-2 h-4 w-4" /> Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
