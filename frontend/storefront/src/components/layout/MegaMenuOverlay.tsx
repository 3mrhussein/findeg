import { useCategories } from '@hooks/useCategories';
import { Link } from '@i18n/navigation';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useLocale } from 'next-intl';
import Image from 'next/image';

interface MegaMenuOverlayProps {
  activeCategorySlug: string | null;
  setActiveCategorySlug: (slug: string | null) => void;
}

/**
 * Mega Menu Overlay (Desktop)
 * Runs full-width beneath the Layer 3 category bar.
 */
export function MegaMenuOverlay({
  activeCategorySlug,
  setActiveCategorySlug,
}: MegaMenuOverlayProps) {
  const locale = useLocale();
  const { categories, isLoading } = useCategories(locale, 'tree');

  // Top level categories (Depth 0)
  const topLevelCategories = categories.filter((c) => c.depth === 0 || !c.parentId) || [];

  // Find the currently hovered category or default to the first one if none selected
  const activeCategory = activeCategorySlug
    ? topLevelCategories.find((c) => c.slug === activeCategorySlug)
    : topLevelCategories[0];

  const subCategories = activeCategory?.children || [];

  if (isLoading) {
    return (
      <div className="w-full h-[420px] bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  if (topLevelCategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-h-[420px] min-h-[420px] bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex cursor-default text-slate-900 dark:text-white">
      {/* Column 1 (20%): List of main categories */}
      <div className="w-1/5 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto py-4">
        {topLevelCategories.map((cat) => {
          const isActive = activeCategory?.id === cat.id;
          return (
            <div
              key={cat.id}
              className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors group ${
                isActive
                  ? 'bg-white dark:bg-slate-950 text-primary border-l-4 border-primary font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border-l-4 border-transparent'
              }`}
              onMouseEnter={() => setActiveCategorySlug(cat.slug)}
            >
              <Link href={`/categories/${cat.slug}`} className="flex-1">
                <span>{cat.name}</span>
              </Link>
              <ChevronRight className="size-4 opacity-50 group-hover:opacity-100 transition-opacity rtl:rotate-180" />
            </div>
          );
        })}
      </div>

      {/* Column 2 (45%): Grid of subcategories */}
      <div className="w-[45%] p-8 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-6 content-start">
        {subCategories.length > 0 ? (
          subCategories.map((sub) => (
            <Link
              href={`/categories/${sub.slug}`}
              key={sub.id}
              className="group flex flex-col gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-none hover:shadow-sm"
            >
              <div className="size-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                {sub.icon ? (
                  <span className="material-symbols-outlined text-[24px]">{sub.icon}</span>
                ) : (
                  <ImageIcon className="size-6" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors line-clamp-1">
                  {sub.name}
                </span>
                {sub.children && sub.children.length > 0 && (
                  <span className="text-[11px] text-slate-400 font-normal">
                    {sub.children.length} sub-items
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60 py-12">
            <span className="material-symbols-outlined text-5xl">category</span>
            <p className="text-sm font-medium">Explore {activeCategory?.name}</p>
          </div>
        )}
      </div>

      {/* Column 3 (35%): Featured Content */}
      <div className="w-[35%] bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-6">
        {activeCategory?.image ? (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-inner group">
            <Image
              src={activeCategory.image}
              alt={activeCategory.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
          </div>
        ) : (
          <div className="w-full h-32 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex flex-col items-center justify-center text-primary/60 font-medium group cursor-pointer hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-4xl mb-1 opacity-40">stars</span>
            <span>Featured {activeCategory?.name}</span>
          </div>
        )}

        <div className="flex-1 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <div className="h-0.5 w-4 bg-primary/40"></div>
            Popular in {activeCategory?.name}
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary transition-all cursor-pointer group hover:-translate-y-0.5">
              <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden relative flex-shrink-0">
                <ImageIcon className="absolute inset-0 m-auto text-slate-300 size-5" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                  Featured Item 1
                </span>
                <span className="text-sm text-primary font-bold">L.E 150.00</span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary transition-all cursor-pointer group hover:-translate-y-0.5">
              <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden relative flex-shrink-0">
                <ImageIcon className="absolute inset-0 m-auto text-slate-300 size-5" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                  Featured Item 2
                </span>
                <span className="text-sm text-primary font-bold">L.E 299.00</span>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={`/categories/${activeCategory?.slug || ''}`}
          className="text-sm font-bold text-primary hover:underline flex items-center gap-2 group w-fit mt-auto"
        >
          <span>View all {activeCategory?.name}</span>
          <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
