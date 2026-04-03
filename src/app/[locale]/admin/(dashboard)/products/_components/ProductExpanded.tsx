/**
 * ProductExpanded — Full detail view for expanded product row
 * Shows tags, variants list, stock health, pricing summary, timestamps
 */

import type { Product } from "@/features/catalog/domain/entities/Product";
import Link from "next/link";
import { ExternalLink, Edit, Eye } from "lucide-react";
import { TagChips } from "@/components/shared/TagChips";
import { StockHealthBar } from "@/app/[locale]/admin/_components/shared/StockHealthBar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Helper to calculate available stock from inventory
function getVariantStock(variant: any): number {
  if (!variant.inventory || variant.inventory.length === 0) return 0;
  return variant.inventory.reduce((sum: number, bal: any) => sum + (bal.onHand - bal.reserved), 0);
}

interface ProductExpandedProps {
  product: Product;
}

export function ProductExpanded({ product }: ProductExpandedProps) {
  const tags =
    product.tags?.map((t) => ({
      id: t.id,
      name: t.key,
      color: t.color || "#6366f1",
    })) || [];
  const variants = product.variants || [];
  const totalStock = variants.reduce((sum, v) => sum + getVariantStock(v), 0);

  // Calculate price range from variants
  const prices = variants.map((v) => v.basePrice || 0).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const priceRange =
    minPrice === maxPrice
      ? `EGP ${minPrice.toLocaleString()}`
      : `EGP ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;

  // Calculate stock health (simple: low if < 10% of variants are in stock)
  const inStockVariants = variants.filter((v) => getVariantStock(v) > 0).length;
  const outOfStockVariants = variants.filter((v) => getVariantStock(v) === 0).length;
  const lowStockVariants = variants.filter((v) => {
    const stock = getVariantStock(v);
    return stock > 0 && stock <= (v.lowStockThreshold || 10);
  }).length;
  const healthyVariants = inStockVariants - lowStockVariants;

  const createdDate = product.createdAt ? format(product.createdAt, "PPP") : "—";
  const updatedDate = product.updatedAt ? format(product.updatedAt, "PPP") : "—";

  return (
    <div className="space-y-4 py-4 px-2 bg-muted/30 rounded-md">
      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Tags</p>
          <TagChips tags={tags} maxVisible={5} />
        </div>
      )}

      {/* Description */}
      {product.description && (
        <div>
          <p className="text-sm font-medium mb-1">Description</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>
      )}

      {/* Variants list */}
      {variants.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Variants ({variants.length})</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {variants.slice(0, 8).map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between px-3 py-2 rounded border bg-background text-sm"
              >
                <span className="font-mono text-xs truncate">{variant.sku}</span>
                <Badge variant="outline" className="text-xs">
                  {getVariantStock(variant)}
                </Badge>
              </div>
            ))}
            {variants.length > 8 && (
              <div className="flex items-center justify-center px-3 py-2 rounded border bg-muted text-sm text-muted-foreground">
                +{variants.length - 8} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock health bar */}
      <div>
        <p className="text-sm font-medium mb-2">Stock Health</p>
        <StockHealthBar
          healthy={healthyVariants}
          low={lowStockVariants}
          out={outOfStockVariants}
          showLabels
        />
        <p className="text-xs text-muted-foreground mt-1">
          {inStockVariants} of {variants.length} variants in stock ({totalStock} units total)
        </p>
      </div>

      {/* Pricing summary */}
      <div>
        <p className="text-sm font-medium mb-1">Pricing</p>
        <p className="text-lg font-semibold">{priceRange}</p>
      </div>

      {/* Rating (if available) - existing logic omitting ... */}

      {/* Action Links */}
      <div className="pt-4 mt-4 border-t flex flex-wrap gap-3">
        <Link
          href={`/${product.locale || "en"}/admin/products/${product.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Edit className="h-4 w-4" />
          Edit Product
        </Link>
        <Link
          href={`/${product.locale || "en"}/products/${product.localizedContent?.slug?.en || product.id}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          View on Storefront
        </Link>
      </div>
    </div>
  );
}
