"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 *
 */
export function ProductMedia() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Images (Comma separated URLs)</FormLabel>
          <FormControl>
            <Input
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              {...field}
            />
          </FormControl>
          <FormDescription>
            For MVP/Demo purposes, enter image URLs separated by commas.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
