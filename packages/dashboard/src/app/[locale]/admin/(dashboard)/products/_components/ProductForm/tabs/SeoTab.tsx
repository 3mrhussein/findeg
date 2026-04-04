"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Textarea } from "@findeg/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { type ProductFormValues } from "@/features/administration/presentation/forms/product-form";
import { Globe, Search } from "lucide-react";

/**
 * SEO & Meta Management Tab
 */
export function SeoTab() {
  const t = useTranslations("Administration.Catalog.Products.Form.Tabs.Seo");
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t("urlHandle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="localizedSlug.en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("slugEn")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                      findeg.com/p/
                    </span>
                    <Input className="pl-[88px]" placeholder="classic-pen-blue" {...field} />
                  </div>
                </FormControl>
                <FormDescription>{t("slugDesc")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {t("searchEngines")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="localizedMetaTitle.en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("metaTitleEn")}</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="localizedMetaTitle.ar"
              render={({ field }) => (
                <FormItem dir="rtl">
                  <FormLabel className="flex w-full justify-end">{t("metaTitleAr")}</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان السيو" className="text-right" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="localizedMetaDescription.en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("metaDescriptionEn")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Meta description..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="localizedMetaDescription.ar"
              render={({ field }) => (
                <FormItem dir="rtl">
                  <FormLabel className="flex w-full justify-end">
                    {t("metaDescriptionAr")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف الميتا..."
                      className="min-h-[80px] resize-none text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6">
          <h4 className="text-sm font-medium mb-4 text-muted-foreground">{t("searchPreview")}</h4>
          <div className="space-y-1">
            <div className="text-blue-600 hover:underline cursor-pointer text-lg font-medium">
              Product Name | FindEg
            </div>
            <div className="text-green-700 text-sm">https://findeg.com/en/p/classic-pen-blue</div>
            <div className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
              Preview of how your product will appear in search engine results. Meta titles and
              descriptions help improve click-through rates.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
