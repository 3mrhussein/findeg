"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryInput } from "@/features/administration/domain/types";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/features/catalog/application/actions/category";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name_en: z.string().min(2, "Name (EN) must be at least 2 characters"),
  description_en: z.string().optional(),
  name_ar: z.string().min(2, "Name (AR) must be at least 2 characters"),
  description_ar: z.string().optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  parentId: z.string().optional(), // String because select values are strings
  icon: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

interface CategoryFormProps {
  initialData?: any;
  categories: { id: number; slug: string; name: string }[];
}

/**
 *
 */
export function CategoryForm({ initialData, categories }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultValues: z.infer<typeof formSchema> = initialData
    ? {
        name_en: initialData.translations.find((t: any) => t.language === "en")?.name || "",
        description_en:
          initialData.translations.find((t: any) => t.language === "en")?.description || "",
        name_ar: initialData.translations.find((t: any) => t.language === "ar")?.name || "",
        description_ar:
          initialData.translations.find((t: any) => t.language === "ar")?.description || "",
        slug: initialData.slug,
        parentId: initialData.parentId?.toString() || "none",
        icon: initialData.icon || "",
        sortOrder: initialData.sortOrder ? Number(initialData.sortOrder) : 0,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      }
    : {
        name_en: "",
        description_en: "",
        name_ar: "",
        description_ar: "",
        slug: "",
        parentId: "none",
        icon: "",
        sortOrder: 0,
        isActive: true,
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  /**
   *
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const input: CategoryInput = {
      slug: values.slug,
      parentId:
        values.parentId && values.parentId !== "none" ? parseInt(values.parentId) : undefined,
      icon: values.icon,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
      translations: [
        { language: "en", name: values.name_en, description: values.description_en },
        { language: "ar", name: values.name_ar, description: values.description_ar },
      ],
    };

    try {
      let result;
      if (initialData) {
        result = await updateCategoryAction(initialData.id, input);
      } else {
        result = await createCategoryAction(input);
      }

      if (result.success) {
        toast({
          title: initialData ? "Category updated" : "Category created",
          description: "The category has been successfully saved.",
        });
        router.push("/admin/categories");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* English Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Category Name" {...field} data-testid="admin-category-name-en" />
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

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="category-slug" {...field} data-testid="admin-category-slug" />
                </FormControl>
                <FormDescription>URL-friendly identifier.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="admin-category-parent-trigger">
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input type="number" {...field} data-testid="admin-category-sort-order" />
                </FormControl>
                <FormDescription>Priority in lists (lower is first)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>Visible in store</FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="admin-category-active"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} data-testid="admin-category-submit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
