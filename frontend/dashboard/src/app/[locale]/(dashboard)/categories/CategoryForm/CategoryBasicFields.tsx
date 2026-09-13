'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Textarea } from '@findeg/ui';
import type { UseFormReturn } from 'react-hook-form';
import type { CategoryFormValues } from './CategoryForm.interface';

interface CategoryBasicFieldsProps {
  form: UseFormReturn<CategoryFormValues>;
}

/**
 * EN + AR name and description fields.
 */
export function CategoryBasicFields({ form }: CategoryBasicFieldsProps) {
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
                <Input
                  placeholder="Category Name"
                  {...field}
                  data-testid="admin-category-name-en"
                />
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
                <Input
                  placeholder="اسم القسم"
                  {...field}
                  className="text-right"
                  data-testid="admin-category-name-ar"
                />
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
                <Textarea
                  placeholder="Category description..."
                  {...field}
                  data-testid="admin-category-description-en"
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
                <Textarea
                  placeholder="وصف القسم..."
                  {...field}
                  className="text-right"
                  data-testid="admin-category-description-ar"
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
