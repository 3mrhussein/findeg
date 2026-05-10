'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Textarea } from '@findeg/ui';

/**
 *
 */
export function ProductSEO() {
  const form = useFormContext();

  return (
    <div className="space-y-6 rounded-lg border p-4">
      <div>
        <h3 className="text-sm font-semibold">Search Engine Optimization</h3>
        <p className="text-xs text-muted-foreground">
          Improve your product&apos;s visibility in search engines.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* English */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="seoTitle_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title (EN)</FormLabel>
                <FormControl>
                  <Input placeholder="SEO Title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seoDescription_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Description (EN)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Meta description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Arabic */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="seoTitle_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title (AR)</FormLabel>
                <FormControl>
                  <Input placeholder="عنوان السيو..." {...field} className="text-right" dir="rtl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seoDescription_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Description (AR)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="وصف الميتا..."
                    {...field}
                    className="text-right"
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
