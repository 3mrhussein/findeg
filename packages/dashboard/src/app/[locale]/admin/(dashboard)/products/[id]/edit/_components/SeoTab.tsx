/**
 * SeoTab — SEO and meta tags tab for edit form
 *
 * Contains URL slugs, meta titles/descriptions, search preview
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/[id]/edit/_components/
 */

"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { BilingualInput } from "@/components/shared/BilingualInput";
import { BilingualTextarea } from "@/components/shared/BilingualTextarea";
import { Search } from "lucide-react";
import type { ProductFormValues } from "@/features/administration/presentation/forms/product-form";

/**
 * SeoTab — SEO metadata and search optimization
 */
export function SeoTab() {
  const { watch } = useFormContext<ProductFormValues>();
  const nameEn = watch("localizedName.en") || "";
  const nameAr = watch("localizedName.ar") || "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Engine Optimization
          </CardTitle>
          <CardDescription>Improve how your product appears in search results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Slug */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">URL Slug</Label>
            <BilingualInput
              nameEn="localizedSlug.en"
              nameAr="localizedSlug.ar"
              placeholderEn="e.g. blue-gel-pen"
              placeholderAr="e.g. قلم-جل-أزرق"
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated from product name if left empty
            </p>
          </div>

          {/* Meta Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Meta Title</Label>
            <BilingualInput
              nameEn="localizedMetaTitle.en"
              nameAr="localizedMetaTitle.ar"
              placeholderEn={nameEn || "Product name"}
              placeholderAr={nameAr || "اسم المنتج"}
            />
            <p className="text-xs text-muted-foreground">
              Defaults to product name if empty (recommended: 50-60 characters)
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Meta Description</Label>
            <BilingualTextarea
              nameEn="localizedMetaDescription.en"
              nameAr="localizedMetaDescription.ar"
              placeholderEn="Brief description for search results..."
              placeholderAr="وصف موجز لنتائج البحث..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
          </div>

          {/* Search Preview */}
          <div className="pt-6 border-t">
            <h4 className="text-sm font-semibold mb-4">Search Result Preview</h4>
            <div className="bg-white p-4 rounded-lg border shadow-sm max-w-[600px] font-sans">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-500">
                  f
                </div>
                <div className="text-xs text-[#202124]">
                  findeg.com
                  <span className="mx-1">›</span>
                  products
                  <span className="mx-1">›</span>
                  {watch("localizedSlug.en") || watch("localizedSlug.ar") || "example-product"}
                </div>
              </div>
              <h3 className="text-[#1a0dab] text-xl leading-snug hover:underline cursor-pointer">
                {watch("localizedMetaTitle.en") ||
                  watch("localizedMetaTitle.ar") ||
                  nameEn ||
                  nameAr ||
                  "Product Title"}
                {" | FindEg"}
              </h3>
              <p className="text-[#4d5156] text-sm leading-normal mt-1 line-clamp-2">
                {watch("localizedMetaDescription.en") ||
                  watch("localizedMetaDescription.ar") ||
                  "No description provided. Add a meta description to improve search visibility and click-through rates."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
