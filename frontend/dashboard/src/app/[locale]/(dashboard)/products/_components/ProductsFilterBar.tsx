"use client";

import { useTranslations } from "next-intl";
import { Search, X, ChevronDown, Filter } from "lucide-react";
import { Input } from "@findeg/ui";
import { Button } from "@findeg/ui";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@findeg/ui";
import { Badge } from "@findeg/ui";
import { Separator } from "@findeg/ui";
import { cn } from "@lib/utils";
import { Options } from "nuqs";

interface ProductsFilterBarProps {
  filters: {
    search: string;
    categoryIds: number[];
    brandIds: number[];
    status: string;
    completeness: string;
  };
  setFilters: (
    values: Partial<{
      search: string | null;
      categoryIds: number[] | null;
      brandIds: number[] | null;
      status: string | null;
      completeness: string | null;
      page: number | null;
    }>,
    options?: Options,
  ) => Promise<URLSearchParams>;
  categories: any[];
  brands: any[];
}

export function ProductsFilterBar({
  filters,
  setFilters,
  categories,
  brands,
}: ProductsFilterBarProps) {
  const t = useTranslations("Administration.Catalog.Products");

  const hasActiveFilters =
    filters.search ||
    filters.categoryIds.length > 0 ||
    filters.brandIds.length > 0 ||
    filters.status ||
    filters.completeness;

  const handleClear = () => {
    setFilters({
      search: null,
      categoryIds: null,
      brandIds: null,
      status: null,
      completeness: null,
      page: 1,
    });
  };

  /** Resolve display name for a category, preferring localizedContent.name.en */
  const getCategoryDisplayName = (cat: any): string => {
    return cat.localizedContent?.name?.en ?? cat.name ?? cat.slug ?? "—";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("SearchPlaceholder")}
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
            className="pl-9 pr-9"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: null, page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 border-dashed">
              <Filter className="mr-2 h-4 w-4" />
              {t("Filters.AllCategories")}
              {filters.categoryIds.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                    {filters.categoryIds.length}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {filters.categoryIds.length > 2 ? (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {filters.categoryIds.length} selected
                      </Badge>
                    ) : (
                      categories
                        .filter((c) => filters.categoryIds.includes(c.id))
                        .map((c) => (
                          <Badge
                            variant="secondary"
                            key={c.id}
                            className="rounded-sm px-1 font-normal"
                          >
                            {getCategoryDisplayName(c)}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            <DropdownMenuLabel>{t("Filters.AllCategories")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat.id}
                checked={filters.categoryIds.includes(cat.id)}
                onCheckedChange={(checked) => {
                  const newIds = checked
                    ? [...filters.categoryIds, cat.id]
                    : filters.categoryIds.filter((id) => id !== cat.id);
                  setFilters({ categoryIds: newIds.length ? newIds : null, page: 1 });
                }}
                style={{ paddingLeft: `${(cat.depth ?? 0) * 16 + 8}px` }}
              >
                {getCategoryDisplayName(cat)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Brands */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 border-dashed">
              <ChevronDown className="mr-2 h-4 w-4" />
              {t("Filters.AllBrands")}
              {filters.brandIds.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                    {filters.brandIds.length}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {filters.brandIds.length > 2 ? (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {filters.brandIds.length} selected
                      </Badge>
                    ) : (
                      brands
                        .filter((b) => filters.brandIds.includes(b.id))
                        .map((b) => (
                          <Badge
                            variant="secondary"
                            key={b.id}
                            className="rounded-sm px-1 font-normal"
                          >
                            {b.name}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>{t("Filters.AllBrands")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {brands.map((brand) => (
              <DropdownMenuCheckboxItem
                key={brand.id}
                checked={filters.brandIds.includes(brand.id)}
                onCheckedChange={(checked) => {
                  const newIds = checked
                    ? [...filters.brandIds, brand.id]
                    : filters.brandIds.filter((id) => id !== brand.id);
                  setFilters({ brandIds: newIds.length ? newIds : null, page: 1 });
                }}
              >
                {brand.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status — Segmented Control */}
        <div className="flex rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden text-sm">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilters({ status: s === "all" ? null : s, page: 1 })}
              className={cn(
                "px-3 py-1.5 capitalize transition-colors",
                (s === "all" && !filters.status) || filters.status === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              )}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Completeness */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 border-dashed">
              {t("Filters.AllCompleteness")}
              {filters.completeness && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {filters.completeness}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["complete", "no-category", "no-images", "no-price", "draft"].map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt}
                checked={filters.completeness === opt}
                onCheckedChange={() => setFilters({ completeness: opt, page: 1 })}
              >
                {t(
                  `Completeness.${opt.charAt(0).toUpperCase() + opt.slice(1).replace("-c", "C").replace("-i", "I").replace("-p", "P")}` as any,
                )}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={!filters.completeness}
              onCheckedChange={() => setFilters({ completeness: null, page: 1 })}
            >
              {t("Filters.AllCompleteness")}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleClear} className="h-10 px-2 lg:px-3">
            {t("Filters.Clear")}
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
