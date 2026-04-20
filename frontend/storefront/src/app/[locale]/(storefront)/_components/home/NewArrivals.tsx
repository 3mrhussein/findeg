import { getHomePageData } from "@/data/catalog/queries";
import { buildHomeFeaturedGroups } from "@findeg/backend/features/catalog";
import { ProductCard } from "../ProductCard";

interface NewArrivalsProps {
  locale: string;
}

/**
 * Self-fetching cached component for the home page new arrivals section.
 *
 * Fetches featured products directly (collocated data fetching) and
 * derives the "newest" subset client-side using `buildHomeFeaturedGroups`.
 * Cached with the `hours` profile — tagged so product writes bust the entry.
 *
 * @param locale - Locale string passed explicitly (required for cache key
 *   isolation and for next-intl compatibility).
 */
export async function NewArrivals({ locale }: NewArrivalsProps) {
  const { featuredProducts } = await getHomePageData(locale);
  const { newest } = buildHomeFeaturedGroups(featuredProducts);
  const newArrivals = newest.slice(0, 8);

  if (!newArrivals.length) return null;

  return (
    <section className="w-full bg-slate-50 dark:bg-slate-900/30 py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          New Arrivals
        </h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
