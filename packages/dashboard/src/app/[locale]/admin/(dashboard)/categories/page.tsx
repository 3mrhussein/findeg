import { getServices } from "@/server/getServices";
import { CategoryTree } from "./_components/CategoryTree";
import { PageHeader } from "@/app/[locale]/admin/_components/shared/PageHeader";
import { resolveLocale } from "@/features/core/domain/value-objects";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
} from "@/actions/catalog-actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getTranslations } from "next-intl/server";

/**
 * Categories Page — Hierarchical tree view of product categories
 */
export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Administration.Catalog.Categories");
  const resolvedLocale = resolveLocale(locale);
  const { adminCategory } = getServices();
  const categories = await adminCategory.getTree(resolvedLocale);

  // Server action for creating/updating categories
  async function handleSaveCategory(data: any, categoryId?: number) {
    "use server";

    const input = {
      localizedContent: {
        name: data.localizedName,
        description: data.localizedDescription,
      },
      parentId: data.parentId,
      icon: data.icon,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      // Use slug from form data (already auto-generated or manually entered)
      slug:
        data.slug ||
        (data.localizedName?.en ?? "untitled")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      name: data.localizedName?.en || "Untitled",
    };

    if (categoryId) {
      // Update existing category
      const result = await updateCategoryAction(categoryId, input as any);
      if (!result.success) {
        console.error("Update failed:", result.error);
        return;
      }
    } else {
      // Create new category
      const result = await createCategoryAction(input as any);
      if (!result.success) {
        console.error("Create failed:", result.error);
        return;
      }
    }

    revalidatePath(`/${locale}/admin/categories`);
  }

  // Server action for deleting categories
  async function handleDeleteCategory(categoryId: number) {
    "use server";

    const result = await deleteCategoryAction(categoryId);
    if (!result.success) {
      console.error("Delete failed:", result.error);
      return;
    }

    revalidatePath(`/${locale}/admin/categories`);
  }

  // Server action for reordering categories
  async function handleReorderCategories(reorderedCategories: any[]) {
    "use server";

    // Call the dedicated transaction route
    const items = reorderedCategories.map((c, i) => ({ id: c.id, sortOrder: i }));
    const result = await reorderCategoriesAction(items);

    if (!result.success) {
      console.error("Reorder failed:", result.error);
      return;
    }

    revalidatePath(`/${locale}/admin/categories`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {t("Title")}
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          {t("Subtitle", { count: categories.length })}
        </p>
      </div>

      <CategoryTree
        categories={categories}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        onReorder={handleReorderCategories}
      />
    </div>
  );
}
