"use client";

import { useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { Product } from "@backend/features/catalog/domain/entities/Product";

interface ProductGridListProps {
  products: Product[];
}

/**
 *
 */
export function ProductGridList({ products }: ProductGridListProps) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "list" ? "list" : "grid";

  if (view === "list") {
    return (
      <div className="flex flex-col gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} layout="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} layout="grid" />
      ))}
    </div>
  );
}
