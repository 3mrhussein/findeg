"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Product } from "@/features/catalog/domain/entities/Product";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Pick<Product, "id" | "name" | "price" | "images" | "imageUrl" | "categoryName">;
}

/**
 *
 */
export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group relative" data-testid={`product-card-${product.id}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
        <div className="absolute top-3 left-3 z-10 rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          New
        </div>

        <Image
          src={
            product.images?.[0] ||
            product.imageUrl ||
            `https://picsum.photos/seed/${product.id}/600/600`
          }
          alt={product.name}
          fill
          className="object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <button
          onClick={() => addToCart(product as Product, 1)}
          data-testid={`product-card-add-${product.id}`}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 w-[90%] bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-white shadow-lg font-bold text-sm py-2 rounded-full flex items-center justify-center gap-2 hover:bg-slate-50 z-20"
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          Add
        </button>
      </div>

      <div className="mt-4 flex justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {product.categoryName || "Stationery"}
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
            <Link href={`/products/${product.id}`} data-testid={`product-card-title-${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0 z-0"></span>
              {product.name}
            </Link>
          </h3>
        </div>
        <p
          className="text-sm font-bold text-slate-900 dark:text-white shrink-0"
          data-testid={`product-card-price-${product.id}`}
        >
          {new Intl.NumberFormat("en-EG", {
            style: "currency",
            currency: "EGP",
          }).format(Number(product.price))}
        </p>
      </div>
    </div>
  );
}
