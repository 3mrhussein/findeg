"use client";

import { useState } from "react";
import { AddToCartButton } from "../../../_components/AddToCartButton";
import { QuantitySelector } from "@components/shared/QuantitySelector";
import { Product } from "@backend/features/catalog/domain/entities/Product";

interface AddToCartSectionProps {
  product: Product;
}

/**
 * Client component to manage quantity state for the PDP.
 */
export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <QuantitySelector quantity={quantity} onChange={setQuantity} />
        <AddToCartButton
          productId={product.id}
          variantId={product.variants?.[0]?.id ?? 0}
          uomCode={product.variants?.[0]?.sellableUoms?.[0]?.uomCode}
          size="lg"
          quantity={quantity}
          className="flex-1 h-14 text-lg rounded-full shadow-lg shadow-primary/25"
        />
      </div>
    </div>
  );
}
