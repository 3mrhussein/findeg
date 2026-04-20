"use client";

import { usePathname, useRouter } from "@i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@lib/utils";
import { Button } from "@findeg/ui";

interface CategoryPillsProps {
  categories: { id: string; label: string; count?: number }[];
}

/**
 * Horizontal scrolling category pill bar for the shop page.
 * Matches the Stitch design with "All" pill + individual categories.
 */
export function CategoryPills({ categories }: CategoryPillsProps) {
  const t = useTranslations("Pages.Shop");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeCategory = searchParams.get("category") || "";

  /**
   *
   */
  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    // Reset page on category change
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  if (categories.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {/* "All" pill */}
        <Button
          variant={!activeCategory ? "default" : "outline"}
          onClick={() => handleCategoryClick("")}
          className={cn(
            "shrink-0 px-5 rounded-full font-bold transition-all duration-200",
            !activeCategory
              ? "shadow-md"
              : "bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600",
          )}
        >
          {t("FiltersAll")}
        </Button>

        {/* Category pills */}
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "shrink-0 px-5 rounded-full font-bold transition-all duration-200",
              activeCategory === category.id
                ? "shadow-md"
                : "bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600",
            )}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
