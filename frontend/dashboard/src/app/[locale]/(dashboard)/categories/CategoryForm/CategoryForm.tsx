"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@findeg/ui";
import { Form } from "@findeg/ui";
import {
  createCategoryAction as createCategory,
  updateCategoryAction as updateCategory,
} from "@data/categories/actions";
import { CategoryInput } from "@findeg/backend/features/administration/domain/types";

import { useRouter } from "@i18n/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@hooks/use-toast";
import type { CategoryFormProps, CategoryFormValues } from "./CategoryForm.interface";
import { categoryFormSchema } from "./CategoryForm.interface";
import { CategoryBasicFields } from "./CategoryBasicFields";
import { CategoryMetaFields } from "./CategoryMetaFields";

/**
 * CategoryForm — create / edit a category with EN/AR fields and metadata.
 */
export function CategoryForm({ initialData, categories }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultValues: CategoryFormValues = initialData
    ? {
        name_en: initialData.localizedContent?.name?.en || initialData.name || "",
        description_en:
          initialData.localizedContent?.description?.en || initialData.description || "",
        name_ar: initialData.localizedContent?.name?.ar || initialData.name || "",
        description_ar:
          initialData.localizedContent?.description?.ar || initialData.description || "",
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

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as Resolver<CategoryFormValues>,
    defaultValues,
  });

  /**
   *
   */
  async function onSubmit(values: CategoryFormValues) {
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
      const result = initialData
        ? await updateCategory(initialData.id, input)
        : await createCategory(input);
      if (result.success) {
        toast({
          title: initialData ? "Category updated" : "Category created",
          description: "The category has been successfully saved.",
        });
        router.push("/categories");
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
        <CategoryBasicFields form={form as any} />
        <CategoryMetaFields form={form as any} categories={categories} />
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
