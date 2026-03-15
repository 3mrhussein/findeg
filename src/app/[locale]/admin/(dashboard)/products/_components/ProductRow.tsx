/**
 * ProductRow — Orchestrates compact/expanded state for a single product
 * Uses EnrichedTableRow base component pattern
 */

"use client";

import type { Product } from "@/features/catalog/domain/entities/Product";
import { EnrichedTableRow } from "@/app/[locale]/admin/_components/table/EnrichedTableRow";
import { ProductCompact } from "./ProductCompact";
import { ProductExpanded } from "./ProductExpanded";
import { ProductQuickActions } from "./ProductQuickActions";

interface ProductRowProps {
  product: Product;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  columnCount?: number;
}

export function ProductRow({ product, isSelected, onSelect, columnCount = 6 }: ProductRowProps) {
  return (
    <EnrichedTableRow
      id={String(product.id)}
      compactContent={<ProductCompact product={product} />}
      expandedContent={
        <div className="space-y-4">
          <ProductExpanded product={product} />
          <ProductQuickActions
            productId={product.id}
            productName={product.name}
            sku={product.skuPrefix}
          />
        </div>
      }
      isSelected={isSelected}
      onSelectChange={onSelect}
      columnCount={columnCount}
    />
  );
}
