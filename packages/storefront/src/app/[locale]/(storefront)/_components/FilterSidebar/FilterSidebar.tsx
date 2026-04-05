"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@findeg/ui";
import { Button } from "@findeg/ui";
import type { FilterSidebarProps } from "./FilterSidebar.interface";
import { applyCategories } from "./FilterSidebar.interface";
import { CategoryTree } from "./CategoryTree";
import { BrandFilter } from "./BrandFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";

/**
 * FilterSidebar — accordion-based filter panel for shop/category/search pages.
 * Categories render as a collapsible checkbox tree; brands as a flat list; price as a slider.
 */
export function FilterSidebar({ categories, brands, minPrice, maxPrice }: FilterSidebarProps) {
  const t = useTranslations("Pages.Shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  const selectedSlugs = searchParams.getAll("categories");
  const hasActiveFilters =
    selectedSlugs.length > 0 || searchParams.has("brands") || searchParams.has("price");

  const handleCategoryToggle = useCallback(
    (slugs: string[], add: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("categories");
      const updated = add
        ? applyCategories(current, slugs, [])
        : applyCategories(current, [], slugs);
      params.delete("categories");
      updated.forEach((s) => params.append("categories", s));
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const handleBrandToggle = useCallback(
    (brandId: string, add: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("brands");
      const updated = add
        ? [...new Set([...current, brandId])]
        : current.filter((b) => b !== brandId);
      params.delete("brands");
      updated.forEach((b) => params.append("brands", b));
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("FiltersTitle")}
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
            className="h-6 px-2 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 dark:hover:bg-primary/10"
          >
            {t("FiltersClearAll")}
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories", "brands", "price"]}
        className="w-full"
      >
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:no-underline hover:text-slate-900 dark:hover:text-white [&>svg]:text-slate-400 dark:[&>svg]:text-slate-500">
            {t("FiltersCategories")}
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-1">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 ps-1">—</p>
            ) : (
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <CategoryTree
                    key={cat.id}
                    category={cat}
                    selectedSlugs={selectedSlugs}
                    onToggle={handleCategoryToggle}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

        {brands.length > 0 && (
          <>
            <AccordionItem value="brands" className="border-none">
              <AccordionTrigger className="py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:no-underline hover:text-slate-900 dark:hover:text-white [&>svg]:text-slate-400 dark:[&>svg]:text-slate-500">
                {t("FiltersBrands")}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-1">
                <BrandFilter
                  brands={brands}
                  selectedBrandIds={searchParams.getAll("brands")}
                  onToggle={handleBrandToggle}
                />
              </AccordionContent>
            </AccordionItem>
            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
          </>
        )}

        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:no-underline hover:text-slate-900 dark:hover:text-white [&>svg]:text-slate-400 dark:[&>svg]:text-slate-500">
            {t("FiltersPrice")}
          </AccordionTrigger>
          <AccordionContent className="pb-5 pt-2">
            <PriceRangeFilter
              priceRange={priceRange}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onChange={setPriceRange}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
