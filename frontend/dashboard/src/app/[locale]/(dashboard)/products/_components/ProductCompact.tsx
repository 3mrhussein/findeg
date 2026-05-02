/**
 * ProductCompact — Single-line compact product row
 * Shows thumbnail + name + SKU/category/brand + stock + status + timestamp
 */

import type { Product } from "@findeg/backend/features/catalog";
import { Badge } from "@findeg/ui";
import { StatusBadge } from "@components/shared/StatusBadge";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface ProductCompactProps {
  product: Product;
}

import { TableCell } from "@findeg/ui";
import { cn } from "@lib/utils";
import { VariantEntity } from "@findeg/backend/features/catalog";

export function ProductCompact({ product }: ProductCompactProps) {
  // Calculate total stock from all variants
  const totalStock =
    product.variants?.reduce((sum, v) => sum + new VariantEntity(v).getAvailableStock(), 0) || 0;
  const hasVariants = (product.variants?.length || 0) > 1;
  const lowStockThreshold = 10;
  const isLowStock = totalStock > 0 && totalStock <= lowStockThreshold;

  // Get primary image from first variant or product mediaSet
  const firstVariantImage = product.variants?.[0]?.images?.[0];
  let primaryImage = "/placeholder-product.png";

  if (firstVariantImage && typeof firstVariantImage === "object" && "url" in firstVariantImage) {
    primaryImage = (firstVariantImage as any).url;
  } else if (product.mediaSet?.thumbnail?.url) {
    primaryImage = product.mediaSet.thumbnail.url;
  }

  const updatedText = product.updatedAt
    ? formatDistanceToNow(product.updatedAt, { addSuffix: true })
    : "—";

  // Get price from first variant if available
  const price = parseInt(product?.variants?.[0]?.basePrice?.toString() || "0") || 0;
  const formattedPrice = new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
  }).format(price);

  return (
    <>
      {/* Thumbnail Cell */}
      <TableCell className="w-16">
        <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted shadow-sm group-hover:scale-105 transition-transform duration-200">
          <Image src={primaryImage} alt={product.name} fill sizes="40px" className="object-cover" />
        </div>
      </TableCell>

      {/* Main info Cell */}
      <TableCell className="min-w-[200px]">
        <div className="flex flex-col">
          <span className="font-bold text-foreground truncate">{product.name}</span>
          <span className="text-xs font-mono text-muted-foreground">
            {product.skuPrefix || "No SKU"}
          </span>
        </div>
      </TableCell>

      {/* Category Cell */}
      <TableCell className="w-40">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {product.categoryName || "—"}
        </span>
      </TableCell>

      {/* Brand Cell */}
      <TableCell className="w-32">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {product.brandName || "—"}
        </span>
      </TableCell>

      {/* Price Cell */}
      <TableCell className="w-28">
        <span className="font-semibold text-primary">{formattedPrice}</span>
      </TableCell>

      {/* Stock indicator Cell */}
      <TableCell className="w-24">
        <div className="flex flex-col">
          <span
            className={cn(
              "text-sm font-bold",
              isLowStock
                ? "text-destructive"
                : totalStock === 0
                  ? "text-muted-foreground"
                  : "text-foreground",
            )}
          >
            {totalStock}
          </span>
          {isLowStock && (
            <span className="text-[10px] uppercase font-bold text-destructive tracking-tight">
              Low Stock
            </span>
          )}
        </div>
      </TableCell>

      {/* Status badge Cell */}
      <TableCell className="w-28">
        <StatusBadge status={product.isActive ? "active" : "draft"} size="sm" />
      </TableCell>

      {/* Updated timestamp Cell */}
      <TableCell className="w-36 text-right">
        <span className="text-xs text-muted-foreground whitespace-nowrap">{updatedText}</span>
      </TableCell>
    </>
  );
}
