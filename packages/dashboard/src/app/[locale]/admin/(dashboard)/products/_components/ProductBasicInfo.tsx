"use client";

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@ui";
import { Input } from "@ui";
import { RichTextEditor } from "@ui";

/**
 *
 */
export function ProductBasicInfo() {
  const form = useFormContext();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (English)</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name_ar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Arabic)</FormLabel>
              <FormControl>
                <Input placeholder="اسم المنتج" {...field} className="text-right" dir="rtl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="description_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (English)</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Product description..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description_ar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Arabic)</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  dir="rtl"
                  placeholder="وصف المنتج..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
