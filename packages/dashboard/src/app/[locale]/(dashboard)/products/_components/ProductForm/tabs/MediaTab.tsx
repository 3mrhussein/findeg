"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@ui";
import { Input } from "@ui";
import { Button } from "@ui";
import { Card, CardContent, CardHeader, CardTitle } from "@ui";
import { Link as LinkIcon, Star, Trash2, ImageIcon } from "lucide-react";
import { type ProductFormValues } from "@dashboard/features/administration/presentation/forms/product-form";

/**
 * Media Management Tab — URL-based only (file upload deferred to Phase 2)
 */
export function MediaTab() {
  const t = useTranslations("Administration.Catalog.Products.Form.Tabs.Media");
  const { control, watch } = useFormContext<ProductFormValues>();

  const {
    fields: images,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "variants.0.images",
  });

  const [imageUrl, setImageUrl] = React.useState("");

  const addImageUrl = () => {
    if (!imageUrl) return;
    append({ url: imageUrl, displayOrder: images.length, alt: "" });
    setImageUrl("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("imageGallery")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL input row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("addByUrl")}
                className="pl-9"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
              />
            </div>
            <Button variant="secondary" onClick={addImageUrl}>
              {t("add")}
            </Button>
          </div>

          {/* Image grid */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg border bg-muted overflow-hidden group"
                >
                  <img
                    src={img.url}
                    alt={img.alt || "Product image"}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-destructive/80"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed bg-muted/20">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-[13px] text-gray-400 text-center">
                Add images via URL. Drag to reorder.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
