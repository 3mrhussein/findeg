"use client";

import type React from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { withShopFilters } from "@/features/catalog/presentation/hoc/withShopFilters";
import type { FilterOption } from "@/features/catalog/application/queries/listing";

interface FilterSidebarProps {
  selectedCategories: string[];
  selectedBrands: string[];
  localPrice: number[];
  setLocalPrice: (value: number[]) => void;
  setPriceRange: (value: number[] | null) => Promise<URLSearchParams>;
  setCategory: (id: string, checked: boolean) => void;
  setBrand: (id: string, checked: boolean) => void;
  clearFilters: () => void;
}

interface FilterSidebarOwnProps {
  categories?: FilterOption[];
  brands?: FilterOption[];
  minPrice?: number;
  maxPrice?: number;
}

/**
 *
 */
function FilterSidebarView({
  categories = [],
  brands = [],
  minPrice = 0,
  maxPrice = 1000,
  selectedCategories,
  selectedBrands,
  localPrice,
  setLocalPrice,
  setPriceRange,
  setCategory,
  setBrand,
  clearFilters,
}: FilterSidebarOwnProps & FilterSidebarProps) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("Pages.Shop.FiltersTitle")}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-auto p-0 text-muted-foreground hover:text-primary"
        >
          {t("Pages.Shop.FiltersClearAll")}
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories", "price", "brands"]}
        className="w-full"
      >
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger>{t("Pages.Shop.FiltersCategories")}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2"
                  data-testid={`filter-category-${category.id}`}
                >
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => setCategory(category.id, checked as boolean)}
                  />
                  <Label
                    htmlFor={`cat-${category.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.label} ({category.count})
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>{t("Pages.Shop.FiltersPrice")}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                defaultValue={[minPrice, maxPrice]}
                min={minPrice}
                max={maxPrice}
                step={10}
                value={localPrice}
                onValueChange={setLocalPrice}
                onValueCommit={setPriceRange} // Update URL only on release
                className="py-4"
                aria-label={t("Pages.Shop.FiltersPrice")}
              />
              <div className="flex items-center justify-between text-sm">
                <div className="border rounded px-2 py-1 min-w-[60px] text-center">
                  {localPrice[0]} EGP
                </div>
                <div className="text-muted-foreground">-</div>
                <div className="border rounded px-2 py-1 min-w-[60px] text-center">
                  {localPrice[1]} EGP
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        <AccordionItem value="brands">
          <AccordionTrigger>{t("Pages.Shop.FiltersBrands")}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center space-x-2"
                  data-testid={`filter-brand-${brand.id}`}
                >
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={(checked) => setBrand(brand.id, checked as boolean)}
                  />
                  <Label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {brand.label} ({brand.count})
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export const FilterSidebar = withShopFilters<FilterSidebarOwnProps>(FilterSidebarView);
