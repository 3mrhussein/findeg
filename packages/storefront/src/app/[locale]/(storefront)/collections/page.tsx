import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getServices } from "@/server/getServices";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { ImageOff, ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "../_components/PageShell";
import { Button } from "@/components/ui/button";

/**
 *
 */
export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CollectionsPageContent params={params} />
    </Suspense>
  );
}

/**
 *
 */
async function CollectionsPageContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  setRequestLocale(resolvedLocale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Pages.Shop" });
  const tNav = await getTranslations({ locale: locale as Locale, namespace: "Nav" });

  const { collections: collectionService, categories: categoriesService } = getServices();
  const [collections, categories] = await Promise.all([
    collectionService.getAllCollections(),
    categoriesService.getAll(resolvedLocale),
  ]);

  const activeCategories = categories.filter((c) => c.isActive !== false).slice(0, 4);

  return (
    <PageShell bg="surface">
      {/* Hero Header */}
      <div className="text-center mb-12 lg:mb-16">
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          {t("CollectionsTitle")}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t("CollectionsDescription")}
        </p>
      </div>

      {/* Featured Collections Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16 lg:mb-20">
        {collections.map((collection) => {
          const title =
            (collection.localizedTitle as Record<string, string>)?.[resolvedLocale] ||
            collection.slug;
          const subtitle =
            (collection.localizedSubtitle as Record<string, string>)?.[resolvedLocale] ||
            t("CollectionsExplore");

          return (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 aspect-4/5 sm:aspect-square md:aspect-4/5 lg:aspect-3/4 border border-transparent dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:hover:border-primary/50 dark:hover:shadow-primary/20"
            >
              {/* Background Image / Placeholder */}
              <div className="absolute inset-0 z-0">
                {collection.heroImageUrl ? (
                  <Image
                    src={collection.heroImageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400">
                    <ImageOff className="size-16 opacity-50" />
                  </div>
                )}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 z-10 bg-linear-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

              {/* Content Overlay */}
              <div className="relative z-20 mt-auto p-6 sm:p-8 flex flex-col">
                <div className="w-full flex-1" />
                <div className="transform transition-all duration-300 group-hover:translate-y-[-8px]">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                    {title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 opacity-90 line-clamp-2">
                    {subtitle}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Trending Categories Section */}
      {activeCategories.length > 0 && (
        <section className="mb-16 lg:mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              {tNav("TrendingCategories")}
            </h2>
            <Link
              href="/categories"
              className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
            >
              {tNav("ViewAll")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            {activeCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug || category.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    alt={category.name}
                    src={category.imageUrl || `https://picsum.photos/seed/${category.id}/400/300`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {category.description || t("CollectionsExplore")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Smart School List CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-800/80 dark:border dark:border-slate-700/50 p-8 lg:p-14">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Sparkles className="size-3.5" />
              {tNav("School.SmartTool")}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white mb-3 tracking-tight">
              {tNav("School.CreateList")}
            </h2>
            <p className="text-slate-400 max-w-lg text-sm lg:text-base leading-relaxed">
              {tNav("School.Description")}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button asChild size="lg" className="rounded-full px-8 font-bold shadow-lg">
              <Link href="/school-lists">{tNav("School.TryFree")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 font-bold border-slate-600 text-white hover:bg-slate-700"
            >
              <Link href="/school-lists">{tNav("School.LearnMore")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
