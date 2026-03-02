"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CategoryFilterOption,
  FilterOption,
} from "@/features/catalog/application/queries/listing";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  categories: CategoryFilterOption[];
  brands: FilterOption[];
  minPrice: number;
  maxPrice: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns all descendant slugs of a category (including itself). */
function getAllSlugs(category: CategoryFilterOption): string[] {
  const slugs = [category.id];
  for (const child of category.children ?? []) {
    slugs.push(...getAllSlugs(child));
  }
  return slugs;
}

/** Toggle categories in the URL params. */
function applyCategories(current: string[], toAdd: string[], toRemove: string[]): string[] {
  const set = new Set(current);
  toRemove.forEach((s) => set.delete(s));
  toAdd.forEach((s) => set.add(s));
  return Array.from(set);
}

// ─── CategoryRow ──────────────────────────────────────────────────────────────

interface CategoryRowProps {
  category: CategoryFilterOption;
  selectedSlugs: string[];
  onToggle: (slugs: string[], forceValue: boolean) => void;
  depth?: number;
}

/**
 *
 */
function CategoryRow({ category, selectedSlugs, onToggle, depth = 0 }: CategoryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = (category.children?.length ?? 0) > 0;

  // ── Determine check state ──────────────────────────────────────────────────
  const childSlugs = (category.children ?? []).map((c) => c.id);
  const selfSelected = selectedSlugs.includes(category.id);
  const selectedChildCount = childSlugs.filter((s) => selectedSlugs.includes(s)).length;

  let checkedState: boolean | "indeterminate";
  if (!hasChildren) {
    // Leaf node: simple self-selected check
    checkedState = selfSelected;
  } else {
    // Parent: state is driven entirely by children
    const allChildrenSelected = childSlugs.length > 0 && selectedChildCount === childSlugs.length;
    const someChildrenSelected = selectedChildCount > 0;
    if (allChildrenSelected) {
      checkedState = true; // ✓ all children selected → fully checked
    } else if (someChildrenSelected) {
      checkedState = "indeterminate"; // ▣ some selected → indeterminate
    } else {
      checkedState = false; // ○ none selected → unchecked
    }
  }

  // ── Toggle handler ──────────────────────────────────────────────────────────
  /**
   *
   */
  const handleToggle = () => {
    if (!hasChildren) {
      // Simple leaf: toggle self
      onToggle([category.id], !selfSelected);
    } else {
      // Parent: either select self + all children, or deselect all
      const allSelected = selfSelected && selectedChildCount === childSlugs.length;
      const allSlugs = getAllSlugs(category);
      onToggle(allSlugs, !allSelected);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2.5 py-1.5 rounded-lg",
          depth > 0 && "ps-3 border-s-2 border-slate-200 dark:border-slate-700 ms-3",
        )}
      >
        {/* Expand/collapse chevron for parents */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronRight
              className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-90")}
            />
          </button>
        ) : (
          <span className="shrink-0 size-3.5" />
        )}

        <Checkbox
          id={`cat-${category.id}-${depth}`}
          checked={checkedState}
          onCheckedChange={handleToggle}
          className={cn(
            "rounded-[4px] shrink-0",
            "border-slate-300 dark:border-slate-600",
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
            "data-[state=indeterminate]:bg-primary/20 data-[state=indeterminate]:border-primary dark:data-[state=indeterminate]:bg-primary/30",
          )}
        />

        <label
          htmlFor={`cat-${category.id}-${depth}`}
          className={cn(
            "flex-1 text-sm leading-none cursor-pointer select-none transition-colors",
            checkedState === true
              ? "font-semibold text-primary"
              : checkedState === "indeterminate"
                ? "font-medium text-primary/80 dark:text-primary/70"
                : "font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          {category.label}
          <span className="ms-1 text-xs text-slate-400 dark:text-slate-500 font-normal">
            ({category.count})
          </span>
        </label>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="ms-3 mt-0.5 space-y-0.5">
          {category.children!.map((child) => (
            <CategoryRow
              key={child.id}
              category={child}
              selectedSlugs={selectedSlugs}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FilterSidebar ────────────────────────────────────────────────────────────

/**
 * FilterSidebar — used on shop, category, collection, and search pages.
 *
 * Categories renders a collapsible tree:
 *  - Selecting a parent selects itself + all children
 *  - Deselecting any child makes the parent show as "indeterminate" (square icon)
 *  - Price slider is local — apply on change
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

  // ── Category toggle ─────────────────────────────────────────────────────────
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

  // ── Brand toggle ──────────────────────────────────────────────────────────
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

  // ── Clear all ─────────────────────────────────────────────────────────────
  /**
   *
   */
  const clearAll = () => router.push(pathname);

  return (
    <div className="flex flex-col gap-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("FiltersTitle")}
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
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
        {/* ── Categories ──────────────────────────────────────────────────── */}
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
                  <CategoryRow
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

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

        {/* ── Brands ──────────────────────────────────────────────────────── */}
        {brands.length > 0 && (
          <>
            <AccordionItem value="brands" className="border-none">
              <AccordionTrigger className="py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:no-underline hover:text-slate-900 dark:hover:text-white [&>svg]:text-slate-400 dark:[&>svg]:text-slate-500">
                {t("FiltersBrands")}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-1">
                <div className="space-y-1.5">
                  {brands.map((brand) => {
                    const checked = searchParams.getAll("brands").includes(brand.id);
                    return (
                      <div key={brand.id} className="flex items-center gap-2.5 py-0.5">
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={checked}
                          onCheckedChange={(val) => handleBrandToggle(brand.id, !!val)}
                          className="rounded-[4px] border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                        />
                        <label
                          htmlFor={`brand-${brand.id}`}
                          className={cn(
                            "text-sm leading-none cursor-pointer select-none transition-colors",
                            checked
                              ? "font-semibold text-primary"
                              : "font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                          )}
                        >
                          {brand.label}
                          <span className="ms-1 text-xs text-slate-400 dark:text-slate-500 font-normal">
                            ({brand.count})
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
          </>
        )}

        {/* ── Price Range ───────────────────────────────────────────────── */}
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:no-underline hover:text-slate-900 dark:hover:text-white [&>svg]:text-slate-400 dark:[&>svg]:text-slate-500">
            {t("FiltersPrice")}
          </AccordionTrigger>
          <AccordionContent className="pb-5 pt-2">
            <div className="space-y-4 px-1">
              <Slider
                value={priceRange}
                onValueChange={(val) => setPriceRange(val as [number, number])}
                max={maxPrice}
                min={minPrice}
                step={1}
                className="**:[[role=slider]]:h-4 **:[[role=slider]]:w-4 **:[[role=slider]]:bg-primary **:[[role=slider]]:border-none **:[[role=slider]]:shadow-md"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="flex-1 text-center py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {priceRange[0].toLocaleString()}{" "}
                  <span className="font-normal text-slate-400">EGP</span>
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">—</span>
                <span className="flex-1 text-center py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {priceRange[1].toLocaleString()}{" "}
                  <span className="font-normal text-slate-400">EGP</span>
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
