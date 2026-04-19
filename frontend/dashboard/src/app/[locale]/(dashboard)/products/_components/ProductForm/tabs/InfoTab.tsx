"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@ui";
import { Input } from "@ui";
import { Textarea } from "@ui";
import { Card, CardContent, CardHeader, CardTitle } from "@ui";
import { type ProductFormValues } from "../../../../../../../features/administration/presentation/forms/product-form";

/**
 * Basic Information Tab — Stacked EN/AR fields (full-width)
 */
export function InfoTab() {
  const t = useTranslations("Administration.Catalog.Products.Form.Tabs.Info");
  const { control, watch } = useFormContext<ProductFormValues>();

  const enName = watch("localizedName.en") || "";
  const arName = watch("localizedName.ar") || "";
  const enDesc = watch("localizedDescription.en") || "";
  const arDesc = watch("localizedDescription.ar") || "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Product Name — Stacked vertically */}
          <FormField
            control={control}
            name="localizedName.en"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between mb-1">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("nameEn")} *
                  </FormLabel>
                  <span className="text-xs text-gray-400">{enName.length}/120</span>
                </div>
                <FormControl>
                  <Input
                    placeholder="e.g. Classic Ballpoint Pen"
                    className="w-full h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="localizedName.ar"
            render={({ field }) => (
              <FormItem dir="rtl">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">{arName.length}/120</span>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("nameAr")} *
                  </FormLabel>
                </div>
                <FormControl>
                  <Input
                    placeholder="مثال: قلم جاف كلاسيك"
                    className="w-full h-10 text-right"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Brief Description — Stacked vertically */}
          <FormField
            control={control}
            name="localizedDescription.en"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between mb-1">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("descriptionEn")}
                  </FormLabel>
                  <span className="text-xs text-gray-400">{enDesc.length}/500</span>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Enter a brief summary..."
                    className="w-full min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="localizedDescription.ar"
            render={({ field }) => (
              <FormItem dir="rtl">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">{arDesc.length}/500</span>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("descriptionAr")}
                  </FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="أدخل وصفاً مختصراً..."
                    className="w-full min-h-[100px] resize-none text-right"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("identifiers")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="skuPrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("skuPrefix")}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. STA-PEN" {...field} />
                </FormControl>
                <FormDescription>{t("skuPrefixDesc")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
