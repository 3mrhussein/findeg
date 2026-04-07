import { Link } from "@i18n/navigation";
import Image from "next/image";
import { resolveLocale } from "@features/core/domain/value-objects";
import { getHomePageData } from "@features/catalog/application/queries/storefront";

interface CollectionsGridProps {
  locale: string;
}

/**
 * Self-fetching cached component for the home page collections grid.
 *
 * Fetches categories directly (collocated data fetching) rather than
 * receiving them via props from the parent. Cached with the `hours`
 * profile — tagged so admin category writes bust the entry.
 *
 * @param locale - Locale string passed explicitly (required for cache key
 *   isolation and for next-intl compatibility).
 */
export async function CollectionsGrid({ locale }: CollectionsGridProps) {
  const { categories: allCategories } = await getHomePageData(locale);
  const visibleCategories = allCategories.filter((c) => c.isActive !== false).slice(0, 3);

  if (!visibleCategories.length) return null;

  return (
    <section className="w-full bg-surface-light dark:bg-background-dark py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Curated Collections
          </h2>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80"
          >
            View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCategories.map((category, idx) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug || category.id}`}
              className={`group relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 ${idx === 2 ? "aspect-4/5 sm:aspect-3/4 sm:col-span-2 lg:col-span-1" : "aspect-4/5 sm:aspect-3/4"}`}
            >
              <Image
                alt={category.name}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                src={`https://picsum.photos/seed/${category.id}/800/1000`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <span className="mb-2 inline-block rounded bg-white/20 px-2 py-1 text-xs font-bold text-white backdrop-blur-md w-fit">
                  Category
                </span>
                <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-slate-200 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  {category.description || "Discover premium quality."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
