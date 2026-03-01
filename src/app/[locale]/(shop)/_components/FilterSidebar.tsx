"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface BrandOption {
  id: string;
  label: string;
  count?: number;
}

interface CategoryOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterSidebarProps {
  categories: CategoryOption[];
  brands: BrandOption[];
  minPrice: number;
  maxPrice: number;
}

/**
 *
 */
export function FilterSidebar({ categories, brands, minPrice, maxPrice }: FilterSidebarProps) {
  const t = useTranslations("Pages.Shop");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("FiltersTitle")}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-primary hover:text-primary/80"
        >
          Clear all
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories", "brands", "price"]}
        className="w-full"
      >
        {/* Categories */}
        <AccordionItem value="categories" className="border-b-0">
          <AccordionTrigger className="text-sm font-bold hover:no-underline">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category.id}`}
                    className="rounded-[4px] border-slate-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 dark:text-slate-300"
                  >
                    {category.label} <span className="text-slate-400">({category.count || 0})</span>
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        <AccordionItem value="brands" className="border-b-0">
          <AccordionTrigger className="text-sm font-bold hover:no-underline">
            Brands
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 space-y-3">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    className="rounded-[4px] border-slate-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 dark:text-slate-300"
                  >
                    {brand.label} <span className="text-slate-400">({brand.count || 0})</span>
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="text-sm font-bold hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-4 px-2 space-y-6">
              <Slider
                defaultValue={[minPrice, maxPrice]}
                max={maxPrice}
                min={minPrice}
                step={1}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-none"
              />
              <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                <span>EGP {minPrice}</span>
                <span>EGP {maxPrice}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
