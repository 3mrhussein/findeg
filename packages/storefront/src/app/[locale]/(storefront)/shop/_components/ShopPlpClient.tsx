"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  List,
  Package,
  SlidersHorizontal,
  SortAsc,
  X,
} from "lucide-react";
import { Link } from "@i18n/navigation";
import { Badge } from "@ui";
import { Button } from "@ui";
import { IconTooltip } from "@ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@ui";
import { FilterPanel, type FilterPanelBrand } from "./FilterPanel";
import { ProductCard, type ProductCardBrand } from "./ProductCard";
import type {
  ShopPlpFilters,
  ShopPlpSort,
  ShopPlpViewModel,
} from "@backend/features/catalog/application/queries/shop-plp";
import { cn } from "@lib/utils";

interface ShopPlpClientProps {
  vm: ShopPlpViewModel;
}

interface ActiveChip {
  id: string;
  label: string;
  onRemove: () => void;
}

type SortOptionMessageKey =
  | "SortPopular"
  | "SortNewest"
  | "SortPriceLowHigh"
  | "SortPriceHighLow"
  | "SortRating";

const SORT_OPTIONS: Array<{ value: ShopPlpSort; key: SortOptionMessageKey }> = [
  { value: "popular", key: "SortPopular" },
  { value: "newest", key: "SortNewest" },
  { value: "price-low-high", key: "SortPriceLowHigh" },
  { value: "price-high-low", key: "SortPriceHighLow" },
  { value: "rating", key: "SortRating" },
];

const PER_PAGE_OPTIONS = [24, 48, 96] as const;

function getVisiblePages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export function ShopPlpClient({ vm }: ShopPlpClientProps) {
  const t = useTranslations("Pages.Shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [loadedBrands, setLoadedBrands] = useState<FilterPanelBrand[]>([]);

  useEffect(() => {
    const abort = new AbortController();

    const loadBrands = async () => {
      try {
        const response = await fetch("/api/v1/brands?active=true", {
          signal: abort.signal,
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as FilterPanelBrand[];
        setLoadedBrands(data || []);
      } catch {
        // Best-effort preload.
      }
    };

    void loadBrands();
    return () => abort.abort();
  }, []);

  const shopRootPath = useMemo(() => {
    const index = pathname.indexOf("/shop");
    if (index < 0) return pathname;
    return pathname.slice(0, index + "/shop".length);
  }, [pathname]);

  const brandById = useMemo(() => {
    const map = new Map<number, ProductCardBrand>();
    for (const brand of loadedBrands) {
      map.set(brand.id, {
        id: brand.id,
        name: brand.name,
        logoUrl: brand.logoUrl,
      });
    }
    return map;
  }, [loadedBrands]);

  const pushWithMutation = (
    mutate: (params: URLSearchParams) => void,
    nextPathname: string = pathname,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const queryString = params.toString();
    router.push(queryString ? `${nextPathname}?${queryString}` : nextPathname);
  };

  const handleApplyFilters = (nextFilters: ShopPlpFilters) => {
    pushWithMutation((params) => {
      params.delete("brandId");
      nextFilters.brandIds.forEach((brandId) => params.append("brandId", String(brandId)));

      if (nextFilters.minPrice <= vm.minPriceBound && nextFilters.maxPrice >= vm.maxPriceBound) {
        params.delete("minPrice");
        params.delete("maxPrice");
      } else {
        params.set("minPrice", String(nextFilters.minPrice));
        params.set("maxPrice", String(nextFilters.maxPrice));
      }

      if (nextFilters.inStockOnly) {
        params.delete("inStock");
      } else {
        params.set("inStock", "false");
      }

      if (nextFilters.ratingMin) {
        params.set("ratingMin", String(nextFilters.ratingMin));
      } else {
        params.delete("ratingMin");
      }

      params.delete("discount");
      nextFilters.discounts.forEach((discount) => params.append("discount", discount));

      params.delete("page");
    });
  };

  const handleCategoryChange = (slugPath: string[]) => {
    const nextCategoryPath =
      slugPath.length > 0 ? `${shopRootPath}/${slugPath.join("/")}` : shopRootPath;
    pushWithMutation((params) => {
      params.delete("page");
    }, nextCategoryPath);
  };

  const handleClearAll = () => {
    pushWithMutation((params) => {
      [
        "q",
        "brandId",
        "minPrice",
        "maxPrice",
        "inStock",
        "sort",
        "page",
        "perPage",
        "ratingMin",
        "discount",
      ].forEach((key) => params.delete(key));
    }, shopRootPath);
  };

  const currentView = searchParams.get("view") === "list" ? "list" : "grid";

  const activeChips: ActiveChip[] = [];

  if (vm.currentCategoryName) {
    activeChips.push({
      id: "category",
      label: vm.currentCategoryName,
      onRemove: () => handleCategoryChange([]),
    });
  }

  if (vm.query.trim()) {
    activeChips.push({
      id: "q",
      label: t("ChipQuery", { query: vm.query }),
      onRemove: () =>
        pushWithMutation((params) => {
          params.delete("q");
          params.delete("page");
        }),
    });
  }

  for (const brandId of vm.filters.brandIds) {
    const brandName = brandById.get(brandId)?.name || t("BrandFallback", { id: brandId });
    activeChips.push({
      id: `brand-${brandId}`,
      label: brandName,
      onRemove: () =>
        handleApplyFilters({
          ...vm.filters,
          brandIds: vm.filters.brandIds.filter((id) => id !== brandId),
        }),
    });
  }

  if (vm.filters.minPrice > vm.minPriceBound || vm.filters.maxPrice < vm.maxPriceBound) {
    activeChips.push({
      id: "price",
      label: t("ChipPrice", {
        min: vm.filters.minPrice.toLocaleString(),
        max: vm.filters.maxPrice.toLocaleString(),
      }),
      onRemove: () =>
        handleApplyFilters({
          ...vm.filters,
          minPrice: vm.minPriceBound,
          maxPrice: vm.maxPriceBound,
        }),
    });
  }

  if (vm.filters.ratingMin) {
    activeChips.push({
      id: "rating",
      label: t("RatingAndAbove", { rating: vm.filters.ratingMin }),
      onRemove: () =>
        handleApplyFilters({
          ...vm.filters,
          ratingMin: undefined,
        }),
    });
  }

  for (const discount of vm.filters.discounts) {
    const label = discount === "on-sale" ? t("OnSale") : t("BundleDeals");
    activeChips.push({
      id: `discount-${discount}`,
      label,
      onRemove: () =>
        handleApplyFilters({
          ...vm.filters,
          discounts: vm.filters.discounts.filter((entry) => entry !== discount),
        }),
    });
  }

  if (!vm.filters.inStockOnly) {
    activeChips.push({
      id: "availability",
      label: t("IncludeOutOfStock"),
      onRemove: () =>
        handleApplyFilters({
          ...vm.filters,
          inStockOnly: true,
        }),
    });
  }

  const visiblePages = useMemo(
    () => getVisiblePages(vm.page, vm.totalPages),
    [vm.page, vm.totalPages],
  );

  return (
    <div className="space-y-4">
      <div className="lg:hidden">
        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal />
                {t("FiltersTitle")}
              </span>
              {activeChips.length > 0 ? <Badge>{activeChips.length}</Badge> : null}
            </Button>
          </SheetTrigger>
          <SheetContent
            side={vm.locale === "ar" ? "right" : "left"}
            className="w-[320px] overflow-y-auto sm:w-[360px]"
          >
            <SheetHeader>
              <SheetTitle>{t("FiltersTitle")}</SheetTitle>
            </SheetHeader>
            <FilterPanel
              locale={vm.locale}
              categorySlugPath={vm.categorySlugPath}
              filters={vm.filters}
              minPriceBound={vm.minPriceBound}
              maxPriceBound={vm.maxPriceBound}
              facetCounts={vm.facetCounts}
              onApplyFilters={handleApplyFilters}
              onClearAll={handleClearAll}
              onCategoryChange={handleCategoryChange}
              onBrandsLoaded={setLoadedBrands}
              onApplyComplete={() => setIsMobileFilterOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border bg-background p-3">
            <FilterPanel
              locale={vm.locale}
              categorySlugPath={vm.categorySlugPath}
              filters={vm.filters}
              minPriceBound={vm.minPriceBound}
              maxPriceBound={vm.maxPriceBound}
              facetCounts={vm.facetCounts}
              onApplyFilters={handleApplyFilters}
              onClearAll={handleClearAll}
              onCategoryChange={handleCategoryChange}
              onBrandsLoaded={setLoadedBrands}
            />
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t("ShowingRange", { from: vm.from, to: vm.to, total: vm.total })}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2">
                <SortAsc className="size-4 text-muted-foreground" />
                <Select
                  value={vm.sort}
                  onValueChange={(value) =>
                    pushWithMutation((params) => {
                      params.set("sort", value);
                      params.delete("page");
                    })
                  }
                >
                  <SelectTrigger className="h-9 w-[190px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="inline-flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
                <IconTooltip label={t("GridView")} asChild>
                  <Button
                    size="icon-sm"
                    variant={currentView === "grid" ? "default" : "ghost"}
                    onClick={() =>
                      pushWithMutation((params) => {
                        params.delete("view");
                      })
                    }
                    aria-label={t("GridView")}
                  >
                    <LayoutGrid />
                  </Button>
                </IconTooltip>
                <IconTooltip label={t("ListView")} asChild>
                  <Button
                    size="icon-sm"
                    variant={currentView === "list" ? "default" : "ghost"}
                    onClick={() =>
                      pushWithMutation((params) => {
                        params.set("view", "list");
                      })
                    }
                    aria-label={t("ListView")}
                  >
                    <List />
                  </Button>
                </IconTooltip>
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <Badge
                  key={chip.id}
                  variant="outline"
                  className="inline-flex items-center gap-1 ps-2"
                >
                  <span>{chip.label}</span>
                  <IconTooltip label={t("RemoveFilter")} asChild>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      aria-label={t("RemoveFilter")}
                      className="inline-flex size-4 items-center justify-center rounded-full hover:bg-muted"
                    >
                      <X className="size-3" />
                    </button>
                  </IconTooltip>
                </Badge>
              ))}
            </div>
          )}

          {vm.products.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-background p-10 text-center">
              <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Package className="size-7" />
              </div>
              <h2 className="text-xl font-semibold">{t("NoProductsTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("NoProductsSuggestion")}</p>
              <Button asChild className="mt-5">
                <Link href="/categories">{t("BrowseAllCategories")}</Link>
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                currentView === "list"
                  ? "space-y-4"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
              )}
            >
              {vm.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  view={currentView}
                  brand={
                    typeof product.brandId === "number" ? brandById.get(product.brandId) : undefined
                  }
                />
              ))}
            </div>
          )}

          {vm.total > 0 && (
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t("ItemsPerPage")}</span>
                <Select
                  value={String(vm.perPage)}
                  onValueChange={(value) =>
                    pushWithMutation((params) => {
                      params.set("perPage", value);
                      params.delete("page");
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {vm.totalPages > 1 && (
                <div className="inline-flex items-center gap-1">
                  <IconTooltip label={t("PaginationPrevious")} asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={vm.page <= 1}
                      onClick={() =>
                        pushWithMutation((params) => {
                          params.set("page", String(vm.page - 1));
                        })
                      }
                      aria-label={t("PaginationPrevious")}
                    >
                      <ArrowLeft />
                    </Button>
                  </IconTooltip>

                  {visiblePages.map((entry, index) =>
                    entry === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-sm text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={entry}
                        variant={entry === vm.page ? "default" : "outline"}
                        size="sm"
                        className="min-w-8"
                        onClick={() =>
                          pushWithMutation((params) => {
                            params.set("page", String(entry));
                          })
                        }
                      >
                        {entry}
                      </Button>
                    ),
                  )}

                  <IconTooltip label={t("PaginationNext")} asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={vm.page >= vm.totalPages}
                      onClick={() =>
                        pushWithMutation((params) => {
                          params.set("page", String(vm.page + 1));
                        })
                      }
                      aria-label={t("PaginationNext")}
                    >
                      <ArrowRight />
                    </Button>
                  </IconTooltip>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
