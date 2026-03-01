import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getServices } from "@/server/getServices";
import { resolveLocale } from "@/features/core/domain/value-objects";

/**
 *
 */
export default function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CategoriesPageContent params={params} />
    </Suspense>
  );
}

/**
 *
 */
async function CategoriesPageContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  setRequestLocale(resolvedLocale);
  const t = await getTranslations({ locale: locale as Locale });

  const { categories: categoriesService, products: productsService } = getServices();
  const [categories, allProducts] = await Promise.all([
    categoriesService.getAll(resolvedLocale),
    productsService.getAll(resolvedLocale),
  ]);

  const activeCategories = categories
    .filter((c) => c.isActive !== false)
    .map((c) => {
      const productsCount = allProducts.filter((p) => p.categoryId === c.id).length;
      return { ...c, productsCount };
    });

  return (
    <div className="bg-surface-light dark:bg-background-dark min-h-screen py-10 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 lg:mb-12">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            {t("Nav.Categories") || "Collections"}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Browse our curated collections of stationery organized perfectly for your needs.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug || category.id}`}
              className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 aspect-[4/5] sm:aspect-square"
            >
              <img
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={
                  (category as any).imageUrl || `https://picsum.photos/seed/${category.id}/800/800`
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <span className="mb-3 inline-block rounded bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md w-fit shadow-sm">
                  {category.productsCount || 0} Products
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-sm text-slate-200 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 line-clamp-2">
                  {category.description || "Discover premium quality supplies."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
