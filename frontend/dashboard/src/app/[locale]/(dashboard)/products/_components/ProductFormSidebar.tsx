"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@findeg/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { type Category, type Brand, type Tag } from "@findeg/backend/features/catalog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@findeg/ui";
import { TagInput } from "@/app/[locale]/_components/shared/TagInput";
import {
  CascadingCategoryPicker,
  type CategoryTreeNode,
} from "@/app/[locale]/_components/shared/CascadingCategoryPicker";
import { cn } from "@lib/utils";

interface ProductFormSidebarProps {
  categories: Category[];
  brands: Brand[];
  tags: Tag[];
}

function buildCategoryTree(flatCategories: Category[]): CategoryTreeNode[] {
  const map = new Map<number, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // Initialize map with nodes using numeric IDs
  flatCategories.forEach((cat) => {
    const id = Number(cat.id);
    map.set(id, { ...cat, children: [] });
  });

  // Build tree by linking children to parents
  flatCategories.forEach((cat) => {
    const id = Number(cat.id);
    const node = map.get(id)!;
    const parentId = cat.parentId ? Number(cat.parentId) : null;

    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Sticky sidebar for product metadata (Publishing, Organization, Summary)
 */
export function ProductFormSidebar({
  categories: flatCategories,
  brands,
  tags,
}: ProductFormSidebarProps) {
  const t = useTranslations("Administration.Catalog.Products.Form.Sidebar");
  const { control, watch } = useFormContext();

  const categoryTree = React.useMemo(() => buildCategoryTree(flatCategories), [flatCategories]);

  // Live summary values
  const variants = watch("variants") || [];
  const firstVariant = variants[0];
  const variantCount = variants.length;
  const imageCount = firstVariant?.images?.length || 0;
  const defaultPrice = firstVariant?.basePrice || 0;

  return (
    <div className="space-y-6">
      {/* STATUS — Radio style Active/Draft */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t("status")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <label
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      field.value
                        ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20"
                        : "border-gray-200 bg-white hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50",
                    )}
                  >
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                      className="text-green-600 accent-green-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-green-500 text-xs">●</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-200">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        Visible in the storefront
                      </p>
                    </div>
                  </label>

                  <label
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      !field.value
                        ? "border-gray-300 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50"
                        : "border-gray-200 bg-white hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50",
                    )}
                  >
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                      className="accent-gray-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 dark:text-slate-600 text-xs">●</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-200">
                          Draft
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        Hidden from storefront
                      </p>
                    </div>
                  </label>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* ORGANIZATION */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t("organization")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("category")}</FormLabel>
                <FormControl>
                  <CascadingCategoryPicker
                    categories={categoryTree}
                    value={field.value || null}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("brand")}</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(val === "none" ? null : parseInt(val))}
                  value={field.value?.toString() || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectBrand")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{t("noBrand")}</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {(brand as any).localizedName?.en || brand.name || "Unnamed Brand"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="tagIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("tags")}</FormLabel>
                <FormControl>
                  <TagInput tags={tags} selectedIds={field.value || []} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* SUMMARY — Live counts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "Variants", value: String(variantCount) },
              { label: "Images", value: String(imageCount) },
              {
                label: "Price",
                value: defaultPrice > 0 ? `EGP ${defaultPrice.toFixed(2)}` : "—",
              },
              {
                label: "Last saved",
                value: "Not saved",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
