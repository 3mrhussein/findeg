"use client";

import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { Copy, Pencil, ExternalLink, Clock } from "lucide-react";
import { Checkbox } from "@ui";
import { Badge } from "@ui";
import { TableCell, TableRow } from "@ui";
import { Avatar, AvatarFallback, AvatarImage } from "@ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui";
import { cn } from "@lib/utils";
import type { ProductListItem } from "@backend/features/administration";
import { Link } from "@i18n/navigation";

interface ProductRowProps {
  product: ProductListItem;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ProductRow({
  product,
  isSelected,
  onSelectChange,
  onDuplicate,
  onDelete,
}: ProductRowProps) {
  const t = useTranslations("Administration.Catalog.Products");

  const formattedPrice = product.defaultVariantPrice
    ? new Intl.NumberFormat("en-EG", {
        style: "currency",
        currency: "EGP",
      }).format(product.defaultVariantPrice)
    : "—";

  const getCompletenessBorder = (status: ProductListItem["completeness"]) => {
    switch (status) {
      case "complete":
        return "border-l-emerald-500";
      case "no-category":
        return "border-l-red-500";
      case "no-images":
        return "border-l-amber-400";
      case "no-price":
        return "border-l-amber-400";
      case "draft":
        return "border-l-gray-300";
      default:
        return "border-l-gray-200";
    }
  };

  const nameEn = product.localizedName.en;
  const initials = nameEn
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TableRow
      className={cn(
        "border-b border-gray-100 hover:bg-gray-50 transition-colors",
        "border-l-4",
        getCompletenessBorder(product.completeness),
        isSelected && "bg-indigo-50/60",
      )}
    >
      <TableCell className="w-[40px]">
        <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelectChange(!!checked)} />
      </TableCell>

      {/* Product Info — no completeness dot */}
      <TableCell className="min-w-[300px]">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md border">
            <AvatarImage src={product.thumbnailUrl || ""} alt={nameEn} />
            <AvatarFallback className="rounded-md bg-muted text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm line-clamp-1">{nameEn}</span>
            <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
          </div>
        </div>
      </TableCell>

      {/* Category & Brand */}
      <TableCell className="hidden lg:table-cell">
        <div className="flex flex-col">
          <span className="text-xs font-medium">{product.categoryName || "—"}</span>
          <span className="text-[10px] text-muted-foreground">{product.brandName || "—"}</span>
        </div>
      </TableCell>

      {/* Price */}
      <TableCell>
        <span className="font-medium text-sm">{formattedPrice}</span>
      </TableCell>

      {/* Stock + Variants (only show variant count when > 1) */}
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                product.totalStock > 0 ? "bg-green-500" : "bg-destructive",
              )}
            />
            <span className="text-xs font-medium">
              {product.totalStock > 0
                ? t("Table.InStock", { count: product.totalStock })
                : t("Table.NoStock")}
            </span>
          </div>
          {product.variantCount > 1 && (
            <span className="text-[10px] text-muted-foreground">
              {product.variantCount} variants
            </span>
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="hidden md:table-cell">
        <Badge
          variant={product.isActive ? "default" : "secondary"}
          className="h-5 text-[10px] px-1.5"
        >
          {t(`Status.${product.isActive ? "Active" : "Inactive"}`)}
        </Badge>
      </TableCell>

      {/* Last Updated */}
      <TableCell className="hidden xl:table-cell text-muted-foreground">
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(product.updatedAt), { addSuffix: true })}
        </div>
      </TableCell>

      {/* Actions — 3 Direct Icon Buttons */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/products/${product.id}/edit`}
                className="w-7 h-7 rounded flex items-center justify-center
                           text-gray-400 hover:text-indigo-600 hover:bg-indigo-50
                           transition-colors"
              >
                <Pencil size={14} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>{t("Actions.Edit")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDuplicate(product.id)}
                className="w-7 h-7 rounded flex items-center justify-center
                           text-gray-400 hover:text-violet-600 hover:bg-violet-50
                           transition-colors"
              >
                <Copy size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t("Actions.Duplicate")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => window.open(`/products/${product.id}`, "_blank")}
                className="w-7 h-7 rounded flex items-center justify-center
                           text-gray-400 hover:text-sky-600 hover:bg-sky-50
                           transition-colors"
              >
                <ExternalLink size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Preview in storefront</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
