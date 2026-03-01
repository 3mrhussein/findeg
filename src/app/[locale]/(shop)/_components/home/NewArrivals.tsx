import { ProductCard } from "../ProductCard";
import { Product } from "@/features/catalog/domain/entities/Product";

/**
 *
 */
export function NewArrivals({ products }: { products: Partial<Product>[] }) {
  if (!products?.length) return null;

  return (
    <section className="w-full bg-slate-50 dark:bg-slate-900/30 py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          New Arrivals
        </h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
