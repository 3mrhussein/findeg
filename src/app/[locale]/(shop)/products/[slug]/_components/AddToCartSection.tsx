"use client";

import { useState } from "react";
import { AddToCartButton } from "../../../_components/AddToCartButton";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { Product } from "@/features/catalog/domain/entities/Product";

interface AddToCartSectionProps {
  product: Pick<
    Product,
    | "id"
    | "name"
    | "price"
    | "currency"
    | "priceMoney"
    | "description"
    | "longDescription"
    | "images"
    | "rating"
    | "reviewsCount"
  >;
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
          product={product as any}
          size="lg"
          quantity={quantity}
          className="flex-1 h-14 text-lg rounded-full shadow-lg shadow-primary/25"
        />
      </div>
    </div>
  );
}
