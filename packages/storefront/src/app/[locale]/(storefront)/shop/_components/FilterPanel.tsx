"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  FolderTree,
  PackageCheck,
  Percent,
  Search,
  Star,
  Tag,
  Wallet,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type {
  ShopPlpDiscount,
  ShopPlpFacetCounts,
  ShopPlpFilters,
} from "@/features/catalog/application/queries/shop-plp";

interface ApiCategoryNode {
  id: number;
  slug: string;
  name: string;
  children?: ApiCategoryNode[];
}

export interface FilterPanelBrand {
  id: number;
  name: string;
  logoUrl?: string | null;
}

interface FilterPanelProps {
  locale: string;
  categorySlugPath: string[];
  filters: ShopPlpFilters;
  minPriceBound: number;
  maxPriceBound: number;
  facetCounts: ShopPlpFacetCounts;
  onApplyFilters: (filters: ShopPlpFilters) => void;
  onClearAll: () => void;
  onCategoryChange: (slugPath: string[]) => void;
  onBrandsLoaded?: (brands: FilterPanelBrand[]) => void;
  onApplyComplete?: () => void;
}

interface CategoryTreeNodeProps {
  node: ApiCategoryNode;
  path: string[];
  currentPath: string[];
  categoryCounts: Record<string, number>;
  onSelect: (slugPath: string[]) => void;
  depth?: number;
}

type GroupId = "categories" | "brands" | "price" | "rating" | "availability" | "discount";

function sanitizePriceRange(
  minPrice: number,
  maxPrice: number,
  lowerBound: number,
  upperBound: number,
): [number, number] {
  const safeMin = Math.min(Math.max(minPrice, lowerBound), upperBound);
  const safeMax = Math.min(Math.max(maxPrice, lowerBound), upperBound);
  return safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin];
}

function CategoryTreeNode({
  node,
  path,
  currentPath,
  categoryCounts,
  onSelect,
  depth = 0,
}: CategoryTreeNodeProps) {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const nodePath = [...path, node.slug];
  const isCurrent = nodePath.join("/") === currentPath.join("/");
  const isCurrentBranch = nodePath.every((slug, index) => currentPath[index] === slug);
  const [expanded, setExpanded] = useState(isCurrentBranch);
  const isExpanded = expanded || isCurrentBranch;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md px-1 py-1.5",
          isCurrent && "bg-primary/10",
        )}
        style={{ paddingInlineStart: `${depth * 12 + 4}px` }}
      >
        {hasChildren ? (
          <IconTooltip label={isExpanded ? "Collapse" : "Expand"} asChild>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronDown
                className={cn("size-4 transition-transform", !isExpanded && "-rotate-90")}
              />
            </button>
          </IconTooltip>
        ) : (
          <span className="inline-flex size-6 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(nodePath)}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-1 py-0.5 text-start text-sm",
            isCurrent
              ? "font-semibold text-primary"
              : "text-foreground/90 hover:text-foreground hover:underline",
          )}
        >
          <span className="truncate">{node.name}</span>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {categoryCounts[node.slug] || 0}
          </Badge>
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              path={nodePath}
              currentPath={currentPath}
              categoryCounts={categoryCounts}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  icon,
  title,
  open,
  onToggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-3 py-3 text-sm font-semibold"
      >
        <span className="inline-flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronDown className={cn("size-4 transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="border-t px-3 py-3">{children}</div>}
    </section>
  );
}

export function FilterPanel({
  locale,
  categorySlugPath,
  filters,
  minPriceBound,
  maxPriceBound,
  facetCounts,
  onApplyFilters,
  onClearAll,
  onCategoryChange,
  onBrandsLoaded,
  onApplyComplete,
}: FilterPanelProps) {
  const t = useTranslations("Pages.Shop");

  const [categories, setCategories] = useState<ApiCategoryNode[]>([]);
  const [brands, setBrands] = useState<FilterPanelBrand[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<GroupId, boolean>>({
    categories: true,
    brands: true,
    price: true,
    rating: true,
    availability: true,
    discount: true,
  });

  const [draftFilters, setDraftFilters] = useState<ShopPlpFilters>(filters);
  const latestDraftRef = useRef(draftFilters);

  useEffect(() => {
    latestDraftRef.current = draftFilters;
  }, [draftFilters]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    const abort = new AbortController();

    const loadFilters = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          fetch(`/api/v1/categories?type=tree&lang=${locale}`, {
            signal: abort.signal,
            cache: "no-store",
          }),
          fetch(`/api/v1/brands?active=true`, {
            signal: abort.signal,
            cache: "no-store",
          }),
        ]);

        if (!categoriesResponse.ok || !brandsResponse.ok) return;

        const [categoriesJson, brandsJson] = (await Promise.all([
          categoriesResponse.json(),
          brandsResponse.json(),
        ])) as [ApiCategoryNode[], FilterPanelBrand[]];

        setCategories(categoriesJson || []);
        setBrands(brandsJson || []);
        onBrandsLoaded?.(brandsJson || []);
      } catch {
        // Best-effort fetch for optional enhancement data.
      }
    };

    void loadFilters();

    return () => abort.abort();
  }, [locale, onBrandsLoaded]);

  const debouncedPriceRange = useDebounce<[number, number]>(
    [draftFilters.minPrice, draftFilters.maxPrice],
    500,
  );

  useEffect(() => {
    const [debouncedMin, debouncedMax] = debouncedPriceRange;
    if (debouncedMin === filters.minPrice && debouncedMax === filters.maxPrice) {
      return;
    }

    onApplyFilters({
      ...latestDraftRef.current,
      minPrice: debouncedMin,
      maxPrice: debouncedMax,
    });
  }, [debouncedPriceRange, filters.maxPrice, filters.minPrice, onApplyFilters]);

  const filteredBrands = useMemo(() => {
    const normalizedSearch = brandSearch.trim().toLowerCase();

    const sorted = [...brands].sort((a, b) => {
      const countDelta =
        (facetCounts.brands[String(b.id)] || 0) - (facetCounts.brands[String(a.id)] || 0);
      if (countDelta !== 0) return countDelta;
      return a.name.localeCompare(b.name);
    });

    if (!normalizedSearch) return sorted;

    return sorted.filter((brand) => brand.name.toLowerCase().includes(normalizedSearch));
  }, [brandSearch, brands, facetCounts.brands]);

  const updateAndApply = (next: ShopPlpFilters) => {
    setDraftFilters(next);
    onApplyFilters(next);
  };

  const updatePriceDraft = (nextMin: number, nextMax: number) => {
    const [minPrice, maxPrice] = sanitizePriceRange(nextMin, nextMax, minPriceBound, maxPriceBound);
    setDraftFilters((current) => ({
      ...current,
      minPrice,
      maxPrice,
    }));
  };

  const handleBrandToggle = (brandId: number, checked: boolean) => {
    const nextBrandIds = checked
      ? Array.from(new Set([...draftFilters.brandIds, brandId]))
      : draftFilters.brandIds.filter((id) => id !== brandId);

    updateAndApply({
      ...draftFilters,
      brandIds: nextBrandIds,
    });
  };

  const handleDiscountToggle = (discount: ShopPlpDiscount, checked: boolean) => {
    const nextDiscounts = checked
      ? Array.from(new Set([...draftFilters.discounts, discount]))
      : draftFilters.discounts.filter((entry) => entry !== discount);

    updateAndApply({
      ...draftFilters,
      discounts: nextDiscounts,
    });
  };

  const toggleGroup = (groupId: GroupId) => {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  };

  const priceLabel = `EGP ${draftFilters.minPrice.toLocaleString()} — EGP ${draftFilters.maxPrice.toLocaleString()}`;

  const ratingRows = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-3">
      <FilterGroup
        icon={<FolderTree className="size-4 text-primary" />}
        title={t("FiltersCategories")}
        open={openGroups.categories}
        onToggle={() => toggleGroup("categories")}
      >
        <div className="max-h-72 space-y-0.5 overflow-auto pe-1">
          {categories.map((category) => (
            <CategoryTreeNode
              key={category.id}
              node={category}
              path={[]}
              currentPath={categorySlugPath}
              categoryCounts={facetCounts.categories}
              onSelect={onCategoryChange}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        icon={<Tag className="size-4 text-primary" />}
        title={t("FiltersBrands")}
        open={openGroups.brands}
        onToggle={() => toggleGroup("brands")}
      >
        <div className="space-y-2">
          {brands.length > 8 && (
            <div className="relative">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={brandSearch}
                onChange={(event) => setBrandSearch(event.target.value)}
                placeholder={t("BrandSearchPlaceholder")}
                className="h-9 ps-8"
              />
            </div>
          )}

          <div className="max-h-64 space-y-2 overflow-auto pe-1">
            {filteredBrands.map((brand) => {
              const checked = draftFilters.brandIds.includes(brand.id);
              const count = facetCounts.brands[String(brand.id)] || 0;

              return (
                <label key={brand.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => handleBrandToggle(brand.id, Boolean(value))}
                  />
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      width={20}
                      height={20}
                      className="size-5 rounded-sm object-contain"
                    />
                  ) : (
                    <span className="inline-flex size-5 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                      <Tag className="size-3" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{brand.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {count}
                  </Badge>
                </label>
              );
            })}
            {filteredBrands.length === 0 && (
              <p className="py-2 text-xs text-muted-foreground">{t("NoBrandsFound")}</p>
            )}
          </div>
        </div>
      </FilterGroup>

      <FilterGroup
        icon={<Wallet className="size-4 text-primary" />}
        title={t("FiltersPrice")}
        open={openGroups.price}
        onToggle={() => toggleGroup("price")}
      >
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground">{priceLabel}</p>

          <Slider
            value={[draftFilters.minPrice, draftFilters.maxPrice]}
            min={minPriceBound}
            max={maxPriceBound}
            step={1}
            onValueChange={(value) => {
              if (value.length !== 2) return;
              updatePriceDraft(value[0], value[1]);
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">
                {t("MinPriceLabel")}
              </label>
              <Input
                type="number"
                inputMode="numeric"
                min={minPriceBound}
                max={draftFilters.maxPrice}
                value={draftFilters.minPrice}
                onChange={(event) =>
                  updatePriceDraft(Number(event.target.value), draftFilters.maxPrice)
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">
                {t("MaxPriceLabel")}
              </label>
              <Input
                type="number"
                inputMode="numeric"
                min={draftFilters.minPrice}
                max={maxPriceBound}
                value={draftFilters.maxPrice}
                onChange={(event) =>
                  updatePriceDraft(draftFilters.minPrice, Number(event.target.value))
                }
              />
            </div>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup
        icon={<Star className="size-4 text-primary" />}
        title={t("RatingFilterTitle")}
        open={openGroups.rating}
        onToggle={() => toggleGroup("rating")}
      >
        <div className="space-y-1">
          {ratingRows.map((row) => {
            const checked = draftFilters.ratingMin === row;
            const count = facetCounts.ratings[row] || 0;

            return (
              <label
                key={row}
                className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1.5"
              >
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="rating-min"
                    checked={checked}
                    onChange={() =>
                      updateAndApply({
                        ...draftFilters,
                        ratingMin: row,
                      })
                    }
                    className="size-4 accent-primary"
                  />
                  <span>{t("RatingAndAbove", { rating: row })}</span>
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {count}
                </Badge>
              </label>
            );
          })}

          {draftFilters.ratingMin ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() =>
                updateAndApply({
                  ...draftFilters,
                  ratingMin: undefined,
                })
              }
            >
              <RotateCcw />
              {t("ClearRating")}
            </Button>
          ) : null}
        </div>
      </FilterGroup>

      <FilterGroup
        icon={<PackageCheck className="size-4 text-primary" />}
        title={t("AvailabilityFilterTitle")}
        open={openGroups.availability}
        onToggle={() => toggleGroup("availability")}
      >
        <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
          <label htmlFor="in-stock-only" className="text-sm font-medium">
            {t("InStockOnly")}
          </label>
          <Switch
            id="in-stock-only"
            checked={draftFilters.inStockOnly}
            onCheckedChange={(value) =>
              updateAndApply({
                ...draftFilters,
                inStockOnly: value,
              })
            }
          />
        </div>
      </FilterGroup>

      <FilterGroup
        icon={<Percent className="size-4 text-primary" />}
        title={t("DiscountFilterTitle")}
        open={openGroups.discount}
        onToggle={() => toggleGroup("discount")}
      >
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1.5 text-sm">
            <span className="flex items-center gap-2">
              <Checkbox
                checked={draftFilters.discounts.includes("on-sale")}
                onCheckedChange={(value) => handleDiscountToggle("on-sale", Boolean(value))}
              />
              {t("OnSale")}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {facetCounts.discounts.onSale}
            </Badge>
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1.5 text-sm">
            <span className="flex items-center gap-2">
              <Checkbox
                checked={draftFilters.discounts.includes("bundle-deals")}
                onCheckedChange={(value) => handleDiscountToggle("bundle-deals", Boolean(value))}
              />
              {t("BundleDeals")}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {facetCounts.discounts.bundleDeals}
            </Badge>
          </label>
        </div>
      </FilterGroup>

      <div className="flex gap-2 pt-1">
        <Button
          className="flex-1"
          onClick={() => {
            onApplyFilters(draftFilters);
            onApplyComplete?.();
          }}
        >
          <SlidersHorizontal />
          {t("ApplyFilters")}
        </Button>
        <Button
          variant="ghost"
          className="flex-1"
          onClick={() => {
            onClearAll();
            onApplyComplete?.();
          }}
        >
          <RotateCcw />
          {t("FiltersClearAll")}
        </Button>
      </div>
    </div>
  );
}
