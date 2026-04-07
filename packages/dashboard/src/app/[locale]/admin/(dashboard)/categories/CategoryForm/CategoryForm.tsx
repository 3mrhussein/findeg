"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ui";
import { Form } from "@ui";
import { deleteCategoryAction } from "@actions/admin-actions";
import { createCategoryAction, updateCategoryAction } from "@actions/admin-actions";
import { CategoryInput } from "@types/admin-inputs";

import { useRouter } from "next/navigation";
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

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as any,
    defaultValues,
  });

  /**
   *
   */
  async function onSubmit(values: CategoryFormValues) {
    setLoading(true);
    const input: CategoryInput = {
      slug: values.slug,
      parentId: values.parentId && values.parentId !== "none" ? parseInt(values.parentId) : null,
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
        ? await updateCategoryAction(initialData.id, input)
        : await createCategoryAction(input);
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
        <CategoryBasicFields form={form} />
        <CategoryMetaFields form={form} categories={categories} />
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
