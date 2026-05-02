"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { Switch } from "@findeg/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@findeg/ui";
import { Separator } from "@findeg/ui";
import { BilingualInput } from "@components/shared/BilingualInput";
import { BilingualTextarea } from "@components/shared/BilingualTextarea";
import { type ProductFormValues } from "@/interfaces";

interface ProductInfoZoneProps {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
}

/**
 * Zone 1 — Product Info
 *
 * Covers:
 * - Localized name (EN/AR)
 * - Localized description (EN/AR)
 * - Category + Brand selectors
 * - Status toggle (active/inactive)
 */
export function ProductInfoZone({ categories, brands }: ProductInfoZoneProps) {
  const { register, watch, setValue } = useFormContext<ProductFormValues>();

  const isActive = watch("isActive") ?? true;
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Product Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Product Name
          </Label>
          <BilingualInput
            nameEn="localizedName.en"
            nameAr="localizedName.ar"
            placeholderEn="e.g. Blue Gel Pen"
            placeholderAr="مثال: قلم جل أزرق"
            required
          />
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Short Description
          </Label>
          <BilingualTextarea
            nameEn="localizedDescription.en"
            nameAr="localizedDescription.ar"
            placeholderEn="Short product description..."
            placeholderAr="وصف مختصر للمنتج..."
            rows={2}
          />
        </div>

        {/* Long Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Full Description
          </Label>
          <BilingualTextarea
            nameEn="localizedLongDescription.en"
            nameAr="localizedLongDescription.ar"
            placeholderEn="Detailed product description, specs, and features..."
            placeholderAr="وصف تفصيلي للمنتج..."
            rows={4}
          />
        </div>

        <Separator />

        {/* Category & Brand */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select
              value={categoryId != null ? String(categoryId) : "none"}
              onValueChange={(v) => setValue("categoryId", v === "none" ? null : Number(v))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Brand</Label>
            <Select
              value={brandId != null ? String(brandId) : "none"}
              onValueChange={(v) => setValue("brandId", v === "none" ? null : Number(v))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Published</Label>
            <p className="text-xs text-muted-foreground">
              {isActive ? "Visible in the store" : "Hidden from customers"}
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
        </div>
      </CardContent>
    </Card>
  );
}
