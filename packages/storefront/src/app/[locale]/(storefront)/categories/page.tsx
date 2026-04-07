import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import Image from "next/image";
import { Link } from "@i18n/navigation";
import { getServices } from "@server/getServices";
import { resolveLocale } from "@features/core/domain/value-objects";
import { PageShell } from "../_components/PageShell";

/**
 * Categories page — data is served from the cached `getAll()` queries in
 * the service layer (backed by `storefront.ts` `'use cache'` functions).
 */
export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <CategoriesPageContent locale={locale} />;
}

/**
 * Categories page content.
 *
 * NOT cached at component level — next-intl's `getTranslations` internally
 * evaluates `i18n/request.ts` which calls `headers()`, breaking `'use cache'`
 * key serialization. Data caching is handled at the query level in
 * `storefront.ts`, so this component benefits from cache hits without needing
 * a `'use cache'` directive here.
 */
async function CategoriesPageContent({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as Locale, namespace: "Pages.Categories" });
  const tNav = await getTranslations({ locale: locale as Locale, namespace: "Nav" });

  const resolvedLocale = resolveLocale(locale);
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
    <PageShell bg="surface">
      {/* Page Header */}
      <div className="mb-10 lg:mb-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          {tNav("Categories")}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          {t("EmptyDescription")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeCategories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug || category.id}`}
            className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 aspect-4/5 sm:aspect-square"
          >
            <Image
              alt={category.name}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              src={category.imageUrl || `https://picsum.photos/seed/${category.id}/800/800`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <span className="mb-3 inline-block rounded bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md w-fit shadow-sm">
                {t("ProductsCount", { count: category.productsCount || 0 })}
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
              <p className="text-sm text-slate-200 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 line-clamp-2">
                {category.description || t("EmptyDescription")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
