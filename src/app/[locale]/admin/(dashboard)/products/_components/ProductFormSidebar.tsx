/**
 * ProductFormSidebar — Sticky sidebar for product create/edit forms
 *
 * Features:
 * - Status toggle (Active/Draft)
 * - Category dropdown
 * - Brand dropdown
 * - Tags input
 * - Product summary card (SKU, variants, stock)
 * - Save Draft / Publish buttons
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/_components/
 * Used by: ProductCreateForm and ProductEditForm
 */

"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle, Package, Layers, Warehouse } from "lucide-react";
import type { ProductFormValues } from "@/features/administration/presentation/forms/product-form";
import { TagChips } from "@/components/shared/TagChips";

interface ProductFormSidebarProps {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  /** Show summary card (edit mode only) */
  showSummary?: boolean;
  isSaving?: boolean;
  /** Is this a new product (create mode)? */
  isNew?: boolean;
  /** Current product entity (for edit mode) */
  product?: import("@/features/catalog/domain/entities/Product").Product;
  /** Available tags for selection */
  allTags?: { id: number; name: string; nameAr?: string; color?: string }[];
}

/**
 * ProductFormSidebar — Sticky sidebar for metadata and actions
 *
 * @example
 * <ProductFormSidebar
 *   categories={categories}
 *   brands={brands}
 *   showSummary={!isNew}
 *   isSaving={isPending}
 *   isNew={isNew}
 * />
 */
const ProductFormSidebar = ({
  categories,
  brands,
  showSummary = false,
  isSaving = false,
  isNew = false,
  product,
  allTags = [],
}: ProductFormSidebarProps) => {
  const { watch, setValue } = useFormContext<ProductFormValues>();

  const isActive = watch("isActive") ?? false;
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
  const variants = watch("variants") || [];
  const tagIds = watch("tagIds") || [];
  const skuPrefix = watch("sku");

  // Calculate summary stats
  const totalVariants = variants.length;

  const totalStock = variants.reduce((sum, v) => {
    // Inventory is not in form state, get it from the product prop if available
    const existingVariant = product?.variants?.find(
      (ev) => ev.id === v.id || (v.sku && ev.sku === v.sku),
    );
    const inventory = existingVariant?.inventory || [];
    const available = inventory.reduce((s: number, inv: any) => s + (inv.onHand - inv.reserved), 0);
    return sum + available;
  }, 0);

  return (
    <div className="sticky top-6 space-y-4">
      {/* Status & Category/Brand Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Product Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-xs text-muted-foreground">
                {isActive ? "Visible in storefront" : "Hidden from customers"}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          <Separator />

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={categoryId != null ? String(categoryId) : "none"}
              onValueChange={(v) => setValue("categoryId", v === "none" ? null : Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Brand</Label>
            <Select
              value={brandId != null ? String(brandId) : "none"}
              onValueChange={(v) => setValue("brandId", v === "none" ? null : Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tags</Label>
              <Badge variant="outline" className="h-5 text-[10px]">
                {tagIds.length} Selected
              </Badge>
            </div>

            <TagChips
              tags={allTags.filter((t) => tagIds.includes(t.id))}
              onRemove={(id) =>
                setValue(
                  "tagIds",
                  tagIds.filter((tid) => tid !== id),
                )
              }
              maxVisible={5}
            />

            <Select
              value="add_tag"
              onValueChange={(v) => {
                if (v === "add_tag") return;
                const id = Number(v);
                if (!tagIds.includes(id)) {
                  setValue("tagIds", [...tagIds, id]);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Add tag..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add_tag" disabled>
                  Add tag...
                </SelectItem>
                {allTags
                  .filter((t: any) => !tagIds.includes(t.id))
                  .map((tag: any) => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      {tag.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Summary Card (Edit mode only) */}
      {showSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Product Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* SKU Prefix */}
            {skuPrefix && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">SKU Prefix</p>
                  <p className="text-sm font-mono font-medium">{skuPrefix}</p>
                </div>
              </div>
            )}

            {/* Variants Count */}
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Variants</p>
                <p className="text-sm font-medium">{totalVariants}</p>
              </div>
            </div>

            {/* Total Stock */}
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Stock</p>
                <p className="text-sm font-medium">{totalStock} units</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="pt-2">
              <Badge variant={isActive ? "default" : "secondary"} className="w-full justify-center">
                {isActive ? "Active" : "Draft"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          {/* Save Draft */}
          <Button type="submit" variant="outline" className="w-full" disabled={isSaving}>
            <Save className="h-4 w-4 me-2" />
            Save Draft
          </Button>

          {/* Publish */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSaving}
            onClick={() => setValue("isActive", true)}
          >
            <CheckCircle className="h-4 w-4 me-2" />
            {isNew ? "Publish Product" : "Publish Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
export { ProductFormSidebar };
