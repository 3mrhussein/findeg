"use client";

import React, { useState, useEffect } from "react";
import { categories } from "@/lib/constants";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { useLocale, useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DOMAIN_DEFAULTS } from "@/features/core/domain/constants/messages";

interface FilterSidebarUIProps {
  title: string;
  categoriesTitle: string;
  priceTitle: string;
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  priceRange: number;
  onPriceChange: (price: number) => void;
  minimumPriceLabel: string;
  selectedPriceLabel: string;
}

/**
 *
 */
export const FilterSidebarUI: React.FC<FilterSidebarUIProps> = ({
  title,
  categoriesTitle,
  priceTitle,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceChange,
  minimumPriceLabel,
  selectedPriceLabel,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["categories", "price"]} className="w-full">
          <AccordionItem value="categories">
            <AccordionTrigger>{categoriesTitle}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {categories.map((cat) => (
                  <label
                    key={cat.name}
                    className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-0"
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => onCategoryChange(cat.name)}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price">
            <AccordionTrigger>{priceTitle}</AccordionTrigger>
            <AccordionContent>
              <div className="relative pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange}
                  onChange={(e) => onPriceChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer min-h-10"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{minimumPriceLabel}</span>
                  <span className="font-semibold text-foreground bg-background border rounded-md px-2 py-0.5">
                    {selectedPriceLabel}
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

interface FilterSidebarProps {
  allProducts: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
}

/**
 *
 */
export const FilterSidebar: React.FC<FilterSidebarProps> = ({ allProducts, onFilterChange }) => {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(100);

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: DOMAIN_DEFAULTS.CURRENCY,
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const filtered = allProducts.filter((product) => {
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(product.categoryName || "");
      const priceMatch = product.price <= priceRange;
      return categoryMatch && priceMatch;
    });
    onFilterChange(filtered);
  }, [selectedCategories, priceRange, allProducts, onFilterChange]);

  /**
   *
   */
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  return (
    <FilterSidebarUI
      title={t("Pages.Shop.FiltersTitle")}
      categoriesTitle={t("Pages.Shop.FiltersCategories")}
      priceTitle={t("Pages.Shop.FiltersPrice")}
      selectedCategories={selectedCategories}
      onCategoryChange={handleCategoryChange}
      priceRange={priceRange}
      onPriceChange={setPriceRange}
      minimumPriceLabel={currencyFormatter.format(0)}
      selectedPriceLabel={currencyFormatter.format(priceRange)}
    />
  );
};
