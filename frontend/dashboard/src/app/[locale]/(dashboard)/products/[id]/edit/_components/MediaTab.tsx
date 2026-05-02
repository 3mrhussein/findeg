/**
 * MediaTab — Product media/images tab for edit form
 *
 * Contains product-level gallery and variant-specific images
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/[id]/edit/_components/
 */

"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@findeg/ui";
import { MediaUpload } from "@/app/[locale]/_components/shared/MediaUpload";
import { Image as ImageIcon } from "lucide-react";
import type { ProductFormValues } from "@/interfaces";

/**
 * MediaTab — Product images and gallery
 */
export function MediaTab() {
  const { watch } = useFormContext<ProductFormValues>();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Product Gallery
          </CardTitle>
          <CardDescription>
            Upload product images. First image will be used as the thumbnail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MediaUpload
            images={[]}
            onChange={(images: any[]) => console.log("Images changed:", images)}
            maxImages={10}
            label="Upload product images"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-1">Variant-Specific Media</h3>
        <p className="text-sm text-muted-foreground px-1">
          Add specific images for each variant. These will override or supplement the main gallery
          when a variant is selected.
        </p>

        <div className="grid gap-6">
          {watch("variants")?.map((variant: any, index: number) => (
            <Card key={variant.id || index}>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-medium">
                  {variant.nameEn || `Variant ${index + 1}`} Media
                </CardTitle>
                <CardDescription className="text-xs">
                  {variant.sku && `SKU: ${variant.sku}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaUpload
                  images={variant.mediaSet?.items?.map((i: any) => i.url) || []}
                  onChange={(images: any[]) =>
                    console.log(`Variant ${index} images changed:`, images)
                  }
                  maxImages={5}
                  label={`Upload images for ${variant.nameEn || "this variant"}`}
                />
              </CardContent>
            </Card>
          ))}
          {(!watch("variants") || watch("variants").length === 0) && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">
                No variants added yet. Manage variants in the &quot;Variants&quot; tab.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
